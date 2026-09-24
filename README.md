# Axiom Discord Bot - React Dashboard

React + M3E (Material 3 Expressive) rewrite of the Axiom staff management dashboard.

## Architecture

- **Frontend:** React 18 + Vite + M3E web components
- **State Management:** Zustand (auth, shifts, moderation)
- **Backend API:** Express (unchanged from original)
- **Theming:** M3E theme provider (Catppuccin Mauve seed color #cba6f7)

## Setup

```bash
npm install
cp .env.example .env  # Update VITE_API_URL if needed
npm run dev
```

Dev server runs on `http://localhost:5173` with proxy to Express backend at `http://localhost:3000`.

## Project Structure

```
src/
├── components/
│   ├── ThemeProvider.jsx      # M3E theme setup
│   ├── ProtectedRoute.jsx     # Auth guard
│   └── Layout.jsx             # NavRail + Toolbar
├── stores/
│   ├── authStore.js           # Discord OAuth + user state
│   └── shiftStore.js          # Shift timer & management
├── pages/
│   ├── Dashboard.jsx          # Main dashboard
│   ├── BanAppeals.jsx         # (TODO)
│   ├── Settings.jsx           # (TODO)
│   ├── Moderation.jsx         # (TODO)
│   └── Login.jsx              # OAuth callback
├── lib/
│   └── api.js                 # Express endpoint wrappers
└── App.jsx                    # Entry point
```

## M3E Usage

All UI components come from `@m3e/react` using official M3E web components:

- **Layout:** NavRail, Toolbar, Card (https://matraic.github.io/m3e/)
- **Inputs:** Button, FormField, Select, Switch (https://matraic.github.io/m3e/)
- **Feedback:** Dialog, Snackbar, LoadingIndicator (https://matraic.github.io/m3e/)
- **Display:** Avatar, List, Table (built with semantic HTML + M3E tokens)

**Rule:** Do NOT invent custom CSS. Use M3E tokens for shape, color, typography from https://matraic.github.io/m3e/#/components/theme.html

## Building

```bash
npm run build
```

Outputs to `dist/`. Express should serve this directory as static files.

## Next Steps

- [ ] Implement BanAppeals page (Stepper, FormField, Dialog)
- [ ] Implement Settings page (Select, Switch, Card)
- [ ] Implement Moderation page (List, Modal)
- [ ] Connect to Express backend auth endpoints
- [ ] Test OAuth flow end-to-end
- [ ] Deploy to Render (point to React build)
