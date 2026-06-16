"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { clearSession, createSession, requireUser } from "@/server/auth";
import { hashPassword, verifyPassword } from "@/server/password";
import { createOrUpdateTrackedProduct, runProductCheck } from "@/server/product-service";

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function registerAction(formData: FormData) {
  const name = getString(formData, "name");
  const email = getString(formData, "email").toLowerCase();
  const password = getString(formData, "password");

  if (!name || !email || password.length < 8) {
    redirect("/register?error=กรุณากรอกข้อมูลให้ครบและตั้งรหัสผ่านอย่างน้อย+8+ตัวอักษร");
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    redirect("/register?error=อีเมลนี้ถูกใช้งานแล้ว");
  }

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash: await hashPassword(password),
    },
  });

  await createSession(user.id);
  redirect("/dashboard");
}

export async function loginAction(formData: FormData) {
  const email = getString(formData, "email").toLowerCase();
  const password = getString(formData, "password");
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user?.passwordHash) {
    redirect("/login?error=อีเมลหรือรหัสผ่านไม่ถูกต้อง");
  }

  const isValid = await verifyPassword(password, user.passwordHash);
  if (!isValid) {
    redirect("/login?error=อีเมลหรือรหัสผ่านไม่ถูกต้อง");
  }

  await createSession(user.id);
  redirect("/dashboard");
}

export async function logoutAction() {
  await clearSession();
  redirect("/");
}

export async function createProductAction(formData: FormData) {
  const user = await requireUser();
  const sourceUrl = getString(formData, "sourceUrl");
  const targetPrice = Number(getString(formData, "targetPrice"));

  if (!sourceUrl || !Number.isFinite(targetPrice) || targetPrice <= 0) {
    redirect("/products/new?error=กรุณากรอกลิงก์สินค้าและราคาเป้าหมายให้ถูกต้อง");
  }

  try {
    await createOrUpdateTrackedProduct({
      userId: user.id,
      sourceUrl,
      targetPrice,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "ไม่สามารถเริ่มติดตามสินค้าได้";
    redirect(`/products/new?error=${encodeURIComponent(message)}`);
  }

  revalidatePath("/dashboard");
  revalidatePath("/products");
  redirect("/products?success=เริ่มติดตามสินค้าเรียบร้อยแล้ว");
}

export async function triggerProductCheckAction(formData: FormData) {
  await requireUser();
  const productId = getString(formData, "productId");

  if (!productId) {
    redirect("/products?error=ไม่พบรหัสสินค้า");
  }

  try {
    await runProductCheck(productId);
  } catch (error) {
    const message = error instanceof Error ? error.message : "ตรวจสอบราคาไม่สำเร็จ";
    redirect(`/products/${productId}?error=${encodeURIComponent(message)}`);
  }

  revalidatePath("/dashboard");
  revalidatePath("/products");
  revalidatePath(`/products/${productId}`);
  redirect(`/products/${productId}?success=ตรวจสอบราคาสำเร็จแล้ว`);
}

export async function updateSettingsAction(formData: FormData) {
  const user = await requireUser();
  const name = getString(formData, "name");
  const telegramChatId = getString(formData, "telegramChatId");
  const telegramEnabled = formData.get("telegramEnabled") === "on";

  await prisma.user.update({
    where: { id: user.id },
    data: {
      name: name || user.name,
      telegramChatId: telegramChatId || null,
      telegramEnabled,
    },
  });

  revalidatePath("/settings");
  redirect("/settings?success=บันทึกการตั้งค่าเรียบร้อยแล้ว");
}

export async function createWatchlistAction(formData: FormData) {
  const user = await requireUser();
  const name = getString(formData, "name");
  const description = getString(formData, "description");
  const isPublic = formData.get("isPublic") === "on";

  if (!name) {
    redirect("/watchlists?error=กรุณาระบุชื่อรายการเฝ้าดู");
  }

  await prisma.watchlist.create({
    data: {
      userId: user.id,
      name,
      description: description || null,
      publicId: `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Math.random().toString(36).slice(2, 8)}`,
      isPublic,
    },
  });

  revalidatePath("/watchlists");
  redirect("/watchlists?success=สร้างรายการเฝ้าดูเรียบร้อยแล้ว");
}

export async function addProductToWatchlistAction(formData: FormData) {
  const user = await requireUser();
  const productId = getString(formData, "productId");
  const watchlistId = getString(formData, "watchlistId");

  if (!productId || !watchlistId) {
    redirect(`/products/${productId}?error=กรุณาเลือกรายการเฝ้าดูก่อน`);
  }

  const watchlist = await prisma.watchlist.findFirst({
    where: { id: watchlistId, userId: user.id },
  });

  if (!watchlist) {
    redirect(`/products/${productId}?error=ไม่พบรายการเฝ้าดู`);
  }

  await prisma.watchlistItem.upsert({
    where: {
      watchlistId_productId: {
        watchlistId,
        productId,
      },
    },
    update: {},
    create: {
      watchlistId,
      productId,
    },
  });

  revalidatePath(`/products/${productId}`);
  revalidatePath("/watchlists");
  redirect(`/products/${productId}?success=เพิ่มสินค้าไปยังรายการเฝ้าดูแล้ว`);
}

export async function deleteProductAction(formData: FormData) {
  const user = await requireUser();
  const productId = getString(formData, "productId");

  if (!productId) {
    redirect("/products?error=ไม่พบรหัสสินค้า");
  }

  await prisma.product.deleteMany({
    where: {
      id: productId,
      userId: user.id,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/products");
  revalidatePath("/watchlists");
  redirect("/products?success=ลบสินค้าเรียบร้อยแล้ว");
}

export async function deleteWatchlistAction(formData: FormData) {
  const user = await requireUser();
  const watchlistId = getString(formData, "watchlistId");

  if (!watchlistId) {
    redirect("/watchlists?error=ไม่พบรหัสรายการเฝ้าดู");
  }

  await prisma.watchlist.deleteMany({
    where: {
      id: watchlistId,
      userId: user.id,
    },
  });

  revalidatePath("/watchlists");
  redirect("/watchlists?success=ลบรายการเฝ้าดูเรียบร้อยแล้ว");
}
