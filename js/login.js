import { signUp, logIn, watchAuthState, friendlyAuthError } from "./auth.js";
import { initTabs } from "./ui.js";

// Respect stored theme preference on this page too
const storedTheme = localStorage.getItem("theme");
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
if (storedTheme ? storedTheme === "dark" : prefersDark) {
  document.documentElement.classList.add("dark");
}

// If already logged in, skip straight to the dashboard
watchAuthState(
  () => {
    window.location.href = "dashboard.html";
  },
  () => {}
);

initTabs("#auth-tabs");

function showError(elId, message) {
  const el = document.getElementById(elId);
  el.textContent = message;
  el.classList.remove("hidden");
}

function hideError(elId) {
  document.getElementById(elId).classList.add("hidden");
}

document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  hideError("login-error");
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  try {
    await logIn(email, password);
    window.location.href = "dashboard.html";
  } catch (error) {
    showError("login-error", friendlyAuthError(error));
  }
});

document.getElementById("signup-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  hideError("signup-error");
  const email = document.getElementById("signup-email").value;
  const password = document.getElementById("signup-password").value;

  try {
    await signUp(email, password);
    window.location.href = "dashboard.html";
  } catch (error) {
    showError("signup-error", friendlyAuthError(error));
  }
});
