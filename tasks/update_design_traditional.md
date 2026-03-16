# Task: Update Design to Traditional Vietnamese Style (Gia Phả)

## 📋 Overview
Update the visual design of the family tree component to match the traditional Vietnamese style provided in the image. This involves adding textures, updating node colors/shapes, changing line styles, and adding decorative components.

## 🛠️ Tech Stack
-   **Core:** Next.js, React
-   **Libraries:** D3.js (tree layout)
-   **Styling:** TailwindCSS v4

## 📐 Design Decisions (Radical Style: TRADITIONAL_HERITAGE)
-   **Geometry:** Sharp nodes (0-2px border-radius) for consistent historical print look.
-   **Typography:** Single style, regular weight names like actual prints.
-   **Palette:** Imperial Yellow (`#fff4b8`), Gold Connectors, Black Text / Red Accents. (Purple Ban ✅).
-   **Structure:** Orthogonal straight line connections (not bezier curves) to match traditional drawings.

---

## 📅 Action Plan

### Phase 1: Assets Preparation
-   [ ] Generate a high-quality parchment paper background texture image using `generate_image`.
-   [ ] Save it to `web/public/bg_parchment.jpg`.

### Phase 2: Code Implementation (`components/FamilyTree.jsx`)
-   [ ] **Background Layout:**
    *   Change root wrapper class from `bg-[#0a0a0a]` to use the generated background image `bg-[url('/bg_parchment.jpg')] bg-cover`.
-   [ ] **Connectors (Links):**
    *   Remove `d3.linkVertical()`.
    *   Implement an **Orthogonal line algorithm** to draw L-shaped/H-shaped paths for connecting parents to children.
    *   Set connector style: Gold fill, solid style like drawing.
-   [ ] **Nodes Styling:**
    *   Update `rx` radius to `2px` (sharp box).
    *   Set node `fill` to yellow gradient or flat yellow (`#fef08a`).
    *   Set node `stroke` to dark gold/brown.
    *   Set text color inside nodes to `#0b0101` (Black).
-   [ ] **Headers & Decoration:**
    *   Add a Floating absolute `Cuốn thư` (Scroll) layout at top center of wrapper.
    *   Add SVG or small image decorations (e.g., Lotus at corner, Dragon corner motifs) for final aesthetic polish.

## 📊 Verification
-   [ ] Visual verification of traditional look: Yellow nodes, Gold lines, Parchment background.
-   [ ] Functionality verification: Zoom/Pan still works smoothly with heavy styled backgrounds.
-   [ ] Interactive side-drawer form remains accurate and styled uniformly.
