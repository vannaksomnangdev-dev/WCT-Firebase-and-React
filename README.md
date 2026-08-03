# TaskFlow (React)

Same app, rebuilt as a React + Vite SPA. Firebase Auth + Firestore stay
exactly the same; the UI logic (tabs, modal, toasts, dark mode, mobile
navbar) is now components/hooks instead of hand-rolled DOM manipulation.

## Stack

- React 18 + Vite
- react-router-dom (`/` = login, `/dashboard` = app, guarded by auth state)
- Tailwind CSS (compiled via PostCSS now, not the CDN build)
- Firebase Authentication (email/password)
- Firebase Firestore (real-time task storage, scoped per user)

## Setup

```bash
npm install
npm run dev
```

Opens on `http://localhost:3000`. Or just double-click `run.bat` on
Windows — it installs dependencies on first run and starts the dev server.

Your Firebase config is already in `src/firebase.js` (copied over from the
old `js/firebase-config.js`). If you ever swap Firebase projects, that's
the only file to touch.

## Firestore rules

Same as before — `firestore.rules` in this folder, unchanged. Paste into
Firebase Console -> Firestore -> Rules if you haven't already.

## Structure

- `src/firebase.js` — Firebase app/auth/db init
- `src/contexts/AuthContext.jsx` — signUp/logIn/logOut + current user,
  exposed via `useAuth()`
- `src/contexts/ToastContext.jsx` — `useToast().showToast(msg, type)`,
  renders the toast stack
- `src/hooks/useTasks.js` — real-time Firestore listener + addTask/
  updateTask/deleteTask
- `src/hooks/useDarkMode.js` — dark mode state, persisted to localStorage
- `src/pages/Login.jsx` — login/signup tabs, redirects to `/dashboard`
  if already signed in
- `src/pages/Dashboard.jsx` — status tabs, task grid, wires up the modal
- `src/components/Navbar.jsx` — responsive navbar incl. mobile menu
- `src/components/TaskCard.jsx` — single task card
- `src/components/TaskModal.jsx` — add/edit modal (Escape + backdrop
  click both close it, same as before)

## Build for production

```bash
npm run build
```

Outputs static files to `dist/` — deploy that folder anywhere (Firebase
Hosting, Netlify, Vercel, etc.). `firebase init hosting` still works fine
if you point its public directory at `dist`.
