import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router-dom"; // 👈 1. Change BrowserRouter to HashRouter
import App from "./App.jsx";
import "./index.css";

const storedTheme = localStorage.getItem("theme");
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
if (storedTheme ? storedTheme === "dark" : prefersDark) {
  document.documentElement.classList.add("dark");
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <HashRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}> {/* 👈 2. Replace BrowserRouter here */}
      <App />
    </HashRouter>
  </React.StrictMode>
);