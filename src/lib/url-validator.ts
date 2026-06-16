const supportedHosts = ["homepro.co.th", "powerbuy.co.th", "advice.co.th", "jib.co.th"];

export function validateStoreUrl(input: string) {
  try {
    const url = new URL(input);
    const supported = supportedHosts.some((host) => url.hostname.includes(host));

    return {
      isValid: supported,
      host: url.hostname,
      message: supported ? "Supported store URL" : "Store not yet supported in MVP",
    };
  } catch {
    return {
      isValid: false,
      host: "",
      message: "Invalid URL format",
    };
  }
}
