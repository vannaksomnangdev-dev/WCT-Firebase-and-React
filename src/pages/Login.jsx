import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth, friendlyAuthError } from "../contexts/AuthContext.jsx";

export default function Login() {
  const { user, loading, signUp, logIn, resetPassword } = useAuth();
  const [tab, setTab] = useState("login");

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupError, setSignupError] = useState("");

  const [resetSent, setResetSent] = useState(false);
const [resetSending, setResetSending] = useState(false);


if (!loading && user) return <Navigate to="/home" replace />;

  async function handleLogin(e) {
    e.preventDefault();
    setLoginError("");
    try {
      await logIn(loginEmail, loginPassword);
    } catch (error) {
      setLoginError(friendlyAuthError(error));
    }
  }

  async function handleForgotPassword() {
  if (!loginEmail.trim()) {
    setLoginError("Enter your email above first, then click 'Forgot password?'");
    return;
  }
  setResetSending(true);
  try {
    await resetPassword(loginEmail.trim());
    setResetSent(true);
  } catch (error) {
    setLoginError(friendlyAuthError(error));
  } finally {
    setResetSending(false);
  }
}

  async function handleSignup(e) {
    e.preventDefault();
    setSignupError("");
    try {
      await signUp(signupEmail, signupPassword);
    } catch (error) {
      setSignupError(friendlyAuthError(error));
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-600 text-white font-bold text-xl mb-3">
            T
          </div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">TaskFlow</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Simple tasks, synced everywhere.</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex bg-slate-100 dark:bg-slate-700 rounded-lg p-1 mb-6">
            <button
              onClick={() => setTab("login")}
              className={`flex-1 text-sm font-medium py-2 rounded-md transition-colors ${
                tab === "login"
                  ? "bg-white dark:bg-slate-600 shadow-sm text-slate-900 dark:text-white"
                  : "text-slate-500 dark:text-slate-300"
              }`}
            >
              Log In
            </button>
            <button
              onClick={() => setTab("signup")}
              className={`flex-1 text-sm font-medium py-2 rounded-md transition-colors ${
                tab === "signup"
                  ? "bg-white dark:bg-slate-600 shadow-sm text-slate-900 dark:text-white"
                  : "text-slate-500 dark:text-slate-300"
              }`}
            >
              Sign Up
            </button>
          </div>

          {tab === "login" ? (
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Email</label>
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Password</label>
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
<button
  type="button"
  onClick={handleForgotPassword}
  disabled={resetSending}
  className="text-xs text-emerald-600 hover:text-emerald-700 self-end disabled:opacity-60"
>
  {resetSending ? "Sending…" : "Forgot password?"}
</button>

{resetSent && (
  <p className="text-xs text-emerald-600">Check your email for a password reset link.</p>
)}
{loginError && <p className="text-xs text-red-500">{loginError}</p>}

<button
  type="submit"
  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors"
>
  Log In
</button>
            </form>
          ) : (
            <form onSubmit={handleSignup} className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Email</label>
                <input
                  type="email"
                  required
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <p className="text-[11px] text-slate-400 mt-1">At least 6 characters.</p>
              </div>
              {signupError && <p className="text-xs text-red-500">{signupError}</p>}
              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors"
              >
                Create Account
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
