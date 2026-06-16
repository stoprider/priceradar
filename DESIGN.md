# DESIGN

## Direction
The UI follows a restrained premium SaaS style inspired by the hierarchy and composure found in `impeccable.style`, while staying practical for dense product data and dashboard use.

## Visual Principles
- Strong hierarchy through type scale, spacing, and panel contrast
- Clean slate, white, and blue palette with sparing accent use
- Cards feel structured and editorial, not glossy or overly decorative
- Readability first for data tables, score badges, and status labels
- Mobile responsive from the start

## Design Tokens
- Background: `#edf2f7`
- Surface: `#ffffff`
- Surface alt: `#f8fafc`
- Ink: `#0f172a`
- Muted ink: `#475569`
- Soft ink: `#94a3b8`
- Accent: `#2563eb`
- Accent strong: `#1d4ed8`
- Divider line: `rgba(148, 163, 184, 0.24)`

## Typography
- Primary: `Manrope`
- Mono/supporting metadata: `IBM Plex Mono`
- Headings are tight and high contrast
- Labels use uppercase tracking for system-level cues

## Components
- Button: rounded pill, minimal variants
- Card: soft panels with high legibility
- Input and Select: roomy controls for Thai and English text
- Badge: semantic tone mapping for deal score and confidence
- Table: dense but readable operational view
- Empty State / Toast / Modal Preview: product-grade supporting states
- Product Card / Price Chart Card: reusable product intelligence blocks

## Notes For Next Iteration
- Add true active-nav state by route segment
- Add dark mode token set after the light mode language is fully stable
- Replace placeholder modal/toast preview with interactive versions
- Add Thai copy pass and icon audit before real launch
