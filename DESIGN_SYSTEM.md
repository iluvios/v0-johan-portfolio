# Design System

Compact reference for Johan Alvarez's portfolio (asjohan.com). Keep new UI consistent with these rules.

## Aesthetic
- Dark only. Calm, editorial layout: large display type, generous spacing, thin borders, one blue→cyan accent.
- Motion is subtle (scroll reveals, gentle parallax) and respects `prefers-reduced-motion`.

## Tokens (`app/globals.css` → `:root`)
Use the tokens through Tailwind (`bg-background`, `text-muted-foreground`, `border-border`, `text-accent`…) or `hsl(var(--token))` in CSS. Don't hardcode slate/blue hex values.

| Token | Use |
| :--- | :--- |
| `--background` | Page canvas |
| `--foreground` | Headings and primary text |
| `--muted-foreground` | Body copy, captions, meta |
| `--primary` (blue) | Primary buttons, gradient start |
| `--accent` (cyan) | Links on hover, markers, eyebrow dots, gradient end |
| `--card` / `--secondary` | Raised surfaces |
| `--border` | Dividers and card outlines |

## Typography
- Display: Space Grotesk (`font-display`, all `h1–h4`), tight tracking.
- Body: Inter (`font-sans`).
- Section pattern: `<Eyebrow>` label + `.section-title` heading.
- Gradient text (blue→cyan) is reserved for one highlight per section (hero last line, first metric).

## Components
- Buttons: `<GlowButton>` (`default` / `outline` / `ghost`, sizes `sm` / `default` / `lg`) from `components/ui/glow-button`.
- Text links: `.text-link` with an `ArrowUpRight` icon.
- Tags: `<Badge variant="tag">`; image overlays use `variant="glass"`.
- Shared portfolio pieces live in `components/portfolio-ui.tsx` (`Eyebrow`, `PageIntro`, `ProjectCard`, `ContactInvitation`…).
- Icons: `lucide-react`, 14–24px.

## Content
- All public copy lives in `lib/i18n.ts` (EN + ES). Contact details and the tool stack live in `lib/site.ts`.
- Claims must be factual: numbers and titles come from the CV stored in the database (`/admin`).
