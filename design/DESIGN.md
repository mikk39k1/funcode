# Design System: The Hearthside Terminal

## 1. Overview & Creative North Star

### Creative North Star: "The Digital Hearth"
This design system rejects the high-stress, high-latency aesthetics of traditional competitive gaming. Instead, it draws inspiration from the "Cottagecore" movement and the mechanical precision of boutique software engineering. Think of this as a high-end mechanical keyboard on a reclaimed oak desk at dusk—warm, tactile, and deeply focused.

We break the "standard platform" look by prioritizing **tonal depth over structural lines**. The interface should feel like a series of layered, soft-lit surfaces rather than a grid of boxes. We use intentional asymmetry and varying corner radii to create an organic, handmade feel that mirrors the charm of *Stardew Valley* without the pixel-art literalism.

---

## 2. Color & Tonal Palette

The palette is rooted in a "Warm Dark" philosophy. We use a deep, desaturated blackberry for the background, layered with glowing ambers, forest greens, and soft lavenders.

### Primary Tones (The Glow)
*   **Primary (`#f0bd8b`):** Our Amber. Use this for moments of "energy" and primary actions. It represents the hearth fire.
*   **Secondary (`#b8cdaa`):** Muted Forest Green. Used for growth, progress, and calm success states.
*   **Tertiary (`#e1cfff`):** Soft Lavender. Used for secondary navigation, subtle highlights, and "magic" interactions.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders for sectioning or containment. 
Boundaries must be defined solely through background color shifts. For example:
*   A `surface-container-low` card sitting on a `surface` background.
*   A `surface-container-high` navigation bar against a `surface-container-low` body.

### Surface Hierarchy & Nesting
Treat the UI as a physical stack of materials. 
1.  **Base Layer:** `surface` (`#100d11`) - The dark room.
2.  **Layout Containers:** `surface-container-low` (`#151217`) - Large layout blocks.
3.  **Active Elements:** `surface-container` (`#1c181e`) - The primary workspace.
4.  **Floating Cards:** `surface-container-highest` (`#29242b`) - Focused content.

### Glass & Signature Textures
For floating modals or popovers, use **Glassmorphism**: 
*   Background: `surface-container` at 70% opacity.
*   Effect: `backdrop-filter: blur(12px)`.
*   Gradient CTAs: Use a subtle linear gradient from `primary` to `primary_container` (135 degrees) to give buttons a soft, internal glow.

---

## 3. Typography: Editorial Clarity

We utilize **Plus Jakarta Sans** for the UI to maintain a friendly, modern approachable feel. For code blocks and technical metadata (where engineers feel "at home"), use a clean monospaced font like **JetBrains Mono** or **Fira Code**.

*   **Display Scales:** Use `display-lg` to `display-sm` sparingly for "Welcome Home" screens. These should have a slightly tighter letter-spacing (-0.02em) to feel premium.
*   **Title Scales:** Use `title-lg` for card headings. These provide the "Editorial" weight.
*   **Body Scales:** `body-lg` is your workhorse. Ensure a line-height of at least 1.6 to maintain the "low-stress" reading experience.
*   **The Monospaced Intervention:** Any time a piece of data is "technical" (e.g., a file path, a variable name, or a timestamp), switch to the monospaced font in `label-md` or `body-sm`.

---

## 4. Elevation & Depth

### The Layering Principle
Forget traditional drop shadows. We achieve depth through **Tonal Layering**. By placing a `surface-container-lowest` card inside a `surface-container-low` section, we create a "sunken" or "lifted" effect through color math alone.

### Ambient Shadows
If an element *must* float (like a main menu or a toast), use "Natural Ambient Shadows":
*   **Color:** `#000000` at 12% opacity.
*   **Blur:** 40px to 60px (extra-diffused).
*   **Spread:** -5px.
*   This mimics the soft shadow cast by a warm lamp rather than a harsh computer UI shadow.

### The "Ghost Border" Fallback
If a border is required for accessibility (e.g., input focus states), use a **Ghost Border**:
*   Token: `outline-variant` (`#4b464e`) at **20% opacity**.
*   This provides a hint of structure without breaking the organic flow of the surface colors.

---

## 5. Component Guidelines

### Buttons: Soft & Tactile
*   **Primary:** Filled with the Amber gradient. Roundedness: `DEFAULT` (1rem). No border.
*   **Secondary:** `surface-container-high` background with `on-surface` text.
*   **Tertiary:** No background. `primary` text. Use `full` (pill) roundedness for tertiary actions to distinguish them from structural buttons.

### Cards: The Content Vessel
*   **Rule:** No dividers. 
*   **Separation:** Use `surface-container` tiers and the **Spacing Scale** (minimum 24px padding) to create separation.
*   **Roundedness:** Content cards should use `lg` (2rem) for a friendly, soft appearance.

### Input Fields: Low-Stress Coding
*   **Unfocused:** `surface-container-low` background. No border.
*   **Focused:** `surface-container-high` background. A subtle `primary` (Amber) 2px "bottom-bar" or a Ghost Border.
*   **Errors:** Use `error_container` for the background and `on_error_container` for the text. Avoid "Harsh Reds"—our error color is a soft coral-terracotta (`#f97758`).

### The "Zen" Code Block
*   A dedicated component for software engineers.
*   Background: `surface-container-lowest` (`#000000`).
*   Roundedness: `md` (1.5rem).
*   Padding: 32px.
*   Syntax Highlighting: Use the `secondary` (Green), `tertiary` (Lavender), and `primary` (Amber) tokens only.

---

## 6. Do's and Don'ts

### Do
*   **Do** use asymmetrical layouts (e.g., a wide left column with a significantly narrower, floating right column).
*   **Do** use "Breathing Room." If you think there's enough white space, add 8px more.
*   **Do** use `secondary` (Forest Green) for success states—it reinforces the "Cozy Garden" theme.

### Don't
*   **Don't** use global leaderboards or "Competitive" UI. Use "Personal Bests" or "Community Milestones."
*   **Don't** use pure white (`#FFFFFF`). The brightest text should be `on_surface` (`#ece3ed`).
*   **Don't** use 90-degree sharp corners. Everything in this system has a minimum of `sm` (0.5rem) roundedness to keep the vibe soft.
*   **Don't** use progress bars that are "Harsh." Use thick, rounded bars in `secondary_container` with a `secondary` fill.

---

## 7. Roundedness Scale Reference
*   **none:** 0px (Prohibited)
*   **sm:** 0.5rem (Inner nested elements)
*   **DEFAULT:** 1rem (Buttons, small cards)
*   **md:** 1.5rem (Standard cards)
*   **lg:** 2rem (Large containers)
*   **xl:** 3rem (Hero sections, unique layout blocks)
*   **full:** 9999px (Pill buttons, tags)