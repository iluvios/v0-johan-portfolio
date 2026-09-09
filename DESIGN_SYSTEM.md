# Design System & UI Specifications

This document defines the core visual guidelines for A.S. Johan's digital strategist portfolio. Feed this file into any AI design agent (e.g. GPT-4o, Astra) as a compact context primer.

---

## 1. Aesthetic Concept
- **Style**: Futuristic, dark-mode, high-tech cyber-minimalism with AI-inspired glows and subtle glassmorphism.
- **Theme**: Dark only (no light mode toggle required).

---

## 2. Color Palette
- **Canvas / Background**: `slate-950` (`#020617`) and `slate-900` (`#0f172a`).
- **Cards & Containers**: `slate-800/50` with `backdrop-blur-[3px]` and `border-slate-700/80`.
- **Primary Accent**: Electric Blue (`#3b82f6` / `blue-500`).
- **Secondary Accent**: Cyan (`#06b6d4` / `cyan-400`).
- **Success / Metrics**: Emerald Green (`#10b981` / `emerald-400`).
- **Text**: `text-white` for titles, `text-slate-300` for body copy, `text-slate-400` for captions.

---

## 3. Typography & Gradients
- **Headings**: `font-bold` with `.gradient-text`:
  ```css
  background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  ```
- **Monospace Accents**: `font-mono text-blue-400` for metrics, code labels, and quotes.

---

## 4. Component Standards
- **Cards**: Use the `.cyber-card` utility class (`border-slate-700 hover:border-blue-400 transition-all duration-300`).
- **Shared Cards**:
  - `<ProjectCard project={project} />` located at `@/components/portfolio/project-card`.
  - `<ArticleCard article={article} />` located at `@/components/portfolio/article-card`.
- **Action Buttons**: `<GlowButton>` located at `@/components/ui/glow-button`.
- **Badges**: `<Badge variant="outline">` or `variant="secondary"` from `@/components/ui/badge`.
- **Icons**: Lucide React (`lucide-react`) size 14–20px.
