# Contributing to Family Hub

Thanks for your interest! This is a small open-source project and contributions are welcome.

## Getting started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/family-hub.git`
3. Install dependencies: `npm install`
4. Start the dev server: `npm run dev`

No environment variables or API keys are needed to run the app locally.

## What to work on

Check the [Issues](https://github.com/nickpoltbuilds/family-hub/issues) tab for open bugs and feature requests. Feel free to open a new issue to discuss an idea before building it.

Good first areas to contribute:

- **New food emoji mappings** in `services/foodEmoji.ts` — more keyword coverage is always welcome
- **Calendar color rules** in `services/calendar.ts` → `assignColor()` — expanding keyword matching
- **New themes** — add a new theme block to `index.css` and the `THEMES` array in `SettingsModal.tsx`
- **Bug fixes** — especially edge cases in iCal parsing or recurring event expansion
- **Accessibility improvements** — ARIA, keyboard navigation, contrast

## Code style

- TypeScript with strict mode enabled
- React functional components with hooks
- Tailwind CSS for layout/spacing; CSS variables for theme colors
- No new external runtime dependencies without discussion — the goal is to keep the bundle small and the setup zero-config

## Submitting a pull request

1. Create a branch: `git checkout -b your-feature-name`
2. Make your changes
3. Build to confirm no TypeScript errors: `npm run build`
4. Open a pull request against `main` with a clear description of what changed and why

## Reporting bugs

Please include:
- Browser and OS version
- Steps to reproduce
- What you expected vs. what happened
- Console errors if any (open DevTools → Console)

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
