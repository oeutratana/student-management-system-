# Agent Guide — Student Management System Frontend

Guide for AI agents working in this repository.

## What This Is

React 19 SPA ("Technology School" student management system) built with **Vite 8**, **Tailwind CSS v4**, **React Router 7**, and **lucide-react** icons. Bilingual (English / Khmer) and role-aware (admin / teacher / student). Talks to the Laravel backend at `http://127.0.0.1:8000/api` (see `system_backend/agent_guide.md`).

## Common Commands

```bash
npm run dev          # Vite dev server (default http://localhost:5173)
npm run build        # production build to dist/
npm run preview      # preview production build
npm run lint         # ESLint (flat config: js + react-hooks + react-refresh)
node scripts/verify-session-store.mjs   # checks the per-tab session behaviour
```

All commands run from this directory (`system/`). There are no tests and no TypeScript.

## Directory Map

| Path | Purpose |
|---|---|
| `src/App.jsx` | ALL routes defined inline (one `<ProtectedRoute><MainLayout><Page/></MainLayout></ProtectedRoute>` wrapper per authenticated route) |
| `src/main.jsx` | Entry; `LanguageProvider` → `App` (which contains `BrowserRouter` + `AuthProvider`) |
| `src/layouts/MainLayout.jsx` | Single layout: CSS-grid shell (sidebar + navbar + page content); collapses to drawer on mobile |
| `src/components/Navbar.jsx` | Sticky header: title, search, KH/EN toggle, notifications bell, profile dropdown |
| `src/components/Sidebar.jsx` | Config-driven nav (5 sections); role-filtered (`teacherPaths`, `studentPaths`) |
| `src/components/ProtectedRoute.jsx` | Renders `AuthPending` until the session is restored, redirects to `/login` with `state.from` when unauthenticated, optional `allowedRoles` gate |
| `src/components/ResourcePage.jsx` | Generic CRUD engine (list table, inline add/edit form, delete confirm, search, permission gating) |
| `src/components/SetupLinkDisplay.jsx` | Copy/open/download UI + QR code for password setup links (`alwaysShowQr` pins the code open inside dialogs) |
| `src/components/Modal.jsx` | The app's only overlay primitive (backdrop, Escape to close, scroll lock); there is no component library |
| `src/components/RowMenu.jsx` | Per-row `⋮` overflow menu. Takes item descriptors (`{ key, label, icon, onSelect, disabled, danger }`), flips upward near the viewport bottom |
| `src/rolePaths.js` | Role vocabulary (`admin`/`teacher`/`student`), `normalizeRole`/`roleOf`, the path set each role may open, and `homePathFor`. Single source of truth for role checks |
| `src/context/AuthContext.jsx` | Auth state; `login()`, `logout()`, `resetSession()`, `/me` rehydration on mount, `authInitializing`; `useAuth()` hook |
| `src/components/AuthPending.jsx` | Full-screen wait shown while a stored token is verified against `/api/me` |
| `src/context/LanguageContext.jsx` | i18n (`en`/`km` → `localStorage app_language`); `t(key, params)`; `useLanguage()` hook |
| `src/pages/` | One page per route (flat, no subfolders). `SetPassword.jsx` is public (token from the query string or the path) and holds the student self-registration flow |
| `src/services/apiClient.js` | Core fetch wrapper: token header, 401 handling, Laravel-style error flattening, `listAll()` pagination walker, `resourceApi()` factory |
| `src/services/schoolApi.js` | Actual endpoint definitions (auth, dashboard, student portal, all `resourceApi` instances) |
| `src/services/sessionStore.js` | Where the session lives: one token per account in `localStorage`, the account of this tab in `sessionStorage` |
| `src/services/studentService.js`, `attendanceService.js` | **Dead stubs** — not imported anywhere, do not use |
| `src/styles/global.css` | ~1800 lines of BEM-style custom CSS (design tokens, app shell, sidebar, navbar, forms, tables, badges, dashboards, responsive rules) |
| `src/translations/index.js` | `en` + `km` message dictionaries |
| `vite.config.js` | Only `react()` + `tailwindcss()` plugins |

## Routing & Navigation

- Routes live **only** in `App.jsx`; add a new page by repeating the wrapper pattern there, then adding a nav entry in `Sidebar.jsx`.
- `/` and the catch-all `*` redirect to `/register` (intentional).
- Sidebar nav model: `{ label, items: [{ label, path, icon }] }`. `icon` is a lucide-react component.
- `MainLayout` maps `location.pathname` → a translation key (`page.*`) for the Navbar title; add new paths to that map.

## Data Fetching & API Layer

- **Use `resourceApi("resource")`** from `schoolApi.js` for any CRUD page. It returns `{ list, show, create, update, remove }`. `.list()` auto-walks pagination and unwraps any envelope shape (`array`, `.data`, `.data.data`, `.items`, `.results`).
- Token read from the session store (`services/sessionStore.js`); on 401 `apiClient` drops that session and hard-redirects to `/login`.
- Errors: `Error.message` (Laravel `message` or first validation error), `.status`, `.errors` (flattened map).
- Fetch patterns: `useEffect` + `then/catch/finally` with `loading`/`error` state; `loadItems` wrapped in `useCallback`; client-side filtering with `useMemo`.
- Build dropdown options with `toOptions(rows, label)` (label may be dot-path string or function).

## CRUD Pages (ResourcePage)

Most entity pages are thin config wrappers rendering `ResourcePage` with declarative props:

- `api` — the `resourceApi` instance
- `title`, `description`, `singular` — all through `t()`
- `columns` — `{ key, label, render? }`; `render` receives the row (badges, avatars, nested `item.department?.name`)
- `fields` — `{ name, label, type?, required?, options?, loadOptions? }`; types: `text`, `select`, `textarea`, `date`, `number`, `email`, `password`
- `searchKeys` — dot-notation paths for the client-side search box
- `managePermission` / `createPermission` — granted if `user.role === "admin"` or in `user.permissions`
- `rowActions`, `onCreated` — customization hooks. `rowActions` / `viewAction` return `RowMenu` item descriptors, **not** markup. `viewAction` renders for anyone who can see the list; `rowActions` is gated behind `managePermission`, as edit and delete are.
- `filters` — optional `select`s that narrow the loaded list client-side (`{ key, label, options?, optionsFrom?, match? }`). `key` is a dotted path; `optionsFrom` reuses the options already fetched for a form field; `match(item, value)` overrides equality. They compose with each other and with `searchKeys`.

New pages for admin CRUD resources should follow this pattern rather than hand-rolling tables/forms.

## Context & State

- Two providers: `AuthProvider` (inside Router in `App.jsx`) and `LanguageProvider` (in `main.jsx`). No Redux/Zustand/React Query.
- Contexts export a named `Provider` + a `useX()` hook; hooks must throw outside the provider. Keep the `/* eslint-disable react-refresh/only-export-components */` comment above the hook export.
- The session is restored from the API, never from storage: the stored token only says a session *may* exist, and `user` stays `null` until `/api/me` answers. `authInitializing` gates every screen that would otherwise redirect on the session (`ProtectedRoute`, `MainLayout`, `Login`, `HomeRedirect`).
- **Sessions are per account and per tab** (`services/sessionStore.js`): `localStorage("auth_sessions")` holds `{ accountId: { token, at } }` for every signed-in account, and `sessionStorage("auth_account")` says which of them *this tab* is signed in as. A browser can hold an admin in one tab and a student in another; with one shared token the tab that signed in last owned all of them, and the other tab switched to that account on its next reload. A tab with no pointer yet falls back to the most recently used session, so a session still survives closing the browser. Sign out empties the pointer, so a signed-out tab never falls back to somebody else's session.
- Role lives at `user.role`, normalised once by `normalizeRole` (use `roleOf(user)` / `isAdmin(user)` from `rolePaths.js`); permissions live at `user.permissions`. The role is never read back from storage.
- `apiClient` holds a `setUnauthorizedHandler` callback that `AuthProvider` registers, so a 401 resets React state as well as storage. It ignores a 401 whose token is no longer the stored one, so a late response cannot sign out a newer session.
- All user-facing strings go through `t("namespace.key", { params })`; add keys to BOTH `en` and `km` in `translations/index.js`.

## Styling

- Two styles coexist; follow what the page you're editing already uses:
  - **Global BEM CSS** (`global.css`): app shell, sidebar, navbar, auth/login, layout, tables, badges (`.badge--blue/green/gray/orange`), buttons (`.primary-button`, `.secondary-button`, `.ghost-button`), forms.
  - **Inline Tailwind utilities** (no `tailwind.config.js`, v4 auto-scans sources): newer pages (`Dashboard`, `Reports`, `Settings`, `ApiExplorer`, `Teachers`, `ResourcePage`). Header cards `rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[...]`; buttons `bg-gradient-to-r from-indigo-600 to-violet-600 ...`; badges `bg-indigo-50 text-indigo-600`.
- Design tokens are CSS custom properties on `:root` (`--primary: #4f46e5`, semantic success/warning/danger pairs).
- `index.css` is just `@import "tailwindcss";`. `App.css` is empty/unused.

## Code Conventions

- One component per file; file name = PascalCase component name (`.jsx`). ESM, relative imports carry extensions (`.jsx`, `.js`).
- Both `export default function X()` and `const X = () => {}; export default X` exist — match the file you're editing.
- Hooks defined inline per-component (no `hooks/` or `utils/` dirs); e.g. `useInView`, `useCountUp` live inside `Dashboard.jsx`.
- Controlled forms read `event.target.name` in `handleChange`.
- Accessibility: `aria-current`, `aria-expanded`, `aria-haspopup`, `role="menu"/"menuitem"`, visible labels, `type="button"` on buttons.
- No comments-heavy style; keep explanatory comments only for non-obvious behavior.
- Style (semicolons/quotes) is inconsistent between files — follow the surrounding file's convention, don't "fix" others.

## Gotchas

- `VITE_API_BASE_URL` overrides the API URL; there is no `.env` file, so it defaults to `http://127.0.0.1:8000/api`.
- Do NOT touch the three stub services (`authService.js`, `studentService.js`, `attendanceService.js`) — the app uses `schoolApi.js`/`apiClient.js`.
- Sidebar CSS still defines `.sidebar__user` / logout styles but the JSX block is gone — don't "restore" it.
- `Settings.jsx` is fully static (no API wiring) — verify before assuming it hits endpoints.
- `dist/`, `node_modules/` are gitignored; run `npm run build` to verify production output only when relevant.
- `ProtectedRoute` passes `state.from`; `Login` honours it (also `?from=`, which survives the hard reload a 401 triggers) but only when the signed-in role may open that path, otherwise `homePathFor(user)`.
- An unrecognised or missing role yields an **empty** path set, never the admin one. `allowedPathsFor` used to return `null` for "admin", which silently gave the full sidebar and layout to anything that was not exactly `"teacher"`/`"student"`.
- Do not add new dependencies without checking they fit the existing stack (plain React + Tailwind + lucide; charts are hand-rolled SVG — no chart library).
- System text in `Dashboard.jsx` mixes real API data with partially hardcoded mock data — don't extend the mock parts as if they were live.

## Definition of Done

1. `npm run lint` is clean
2. `npm run build` succeeds if you touched build-relevant code
3. New routes registered in `App.jsx` + nav entry in `Sidebar.jsx` + path→title mapping in `MainLayout.jsx`
4. New UI strings added to BOTH `en` and `km` dictionaries in `translations/index.js`
5. New API calls go through `apiClient.js` / `schoolApi.js` (never raw `fetch`)