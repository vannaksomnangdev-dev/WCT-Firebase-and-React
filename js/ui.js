// Mobile navbar toggle
export function initNavbar() {
  const toggleBtn = document.getElementById("navbar-toggle");
  const menu = document.getElementById("navbar-menu");
  if (!toggleBtn || !menu) return;

  toggleBtn.addEventListener("click", () => {
    const isOpen = menu.classList.contains("max-h-96");
    if (isOpen) {
      menu.classList.remove("max-h-96", "opacity-100");
      menu.classList.add("max-h-0", "opacity-0");
    } else {
      menu.classList.remove("max-h-0", "opacity-0");
      menu.classList.add("max-h-96", "opacity-100");
    }
  });
}

// Modal open/close with backdrop click + Escape key
export function initModal(modalId, { onOpen, onClose } = {}) {
  const modal = document.getElementById(modalId);
  if (!modal) return { open: () => {}, close: () => {} };

  const panel = modal.querySelector("[data-modal-panel]");

  const open = () => {
    modal.classList.remove("hidden");
    requestAnimationFrame(() => {
      modal.classList.remove("opacity-0");
      panel?.classList.remove("scale-95", "opacity-0");
      panel?.classList.add("scale-100", "opacity-100");
    });
    document.body.classList.add("overflow-hidden");
    onOpen?.();
  };

  const close = () => {
    modal.classList.add("opacity-0");
    panel?.classList.remove("scale-100", "opacity-100");
    panel?.classList.add("scale-95", "opacity-0");
    document.body.classList.remove("overflow-hidden");
    setTimeout(() => modal.classList.add("hidden"), 200);
    onClose?.();
  };

  modal.addEventListener("click", (e) => {
    if (e.target === modal) close();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal.classList.contains("hidden")) close();
  });

  modal.querySelectorAll("[data-modal-close]").forEach((btn) => {
    btn.addEventListener("click", close);
  });

  return { open, close };
}

// Toast notifications
let toastContainer;

function getToastContainer() {
  if (!toastContainer) {
    toastContainer = document.createElement("div");
    toastContainer.className =
      "fixed bottom-6 right-6 z-[100] flex flex-col gap-2 items-end";
    document.body.appendChild(toastContainer);
  }
  return toastContainer;
}

export function showToast(message, type = "success") {
  const container = getToastContainer();

  const colors = {
    success: "bg-emerald-600",
    error: "bg-red-600",
    info: "bg-slate-700",
  };

  const toast = document.createElement("div");
  toast.className = `${colors[type] || colors.info} text-white text-sm font-medium px-4 py-3 rounded-lg shadow-lg opacity-0 translate-y-2 transition-all duration-200 max-w-xs`;
  toast.textContent = message;
  container.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.remove("opacity-0", "translate-y-2");
  });

  setTimeout(() => {
    toast.classList.add("opacity-0", "translate-y-2");
    setTimeout(() => toast.remove(), 200);
  }, 3000);
}

// Tabs
export function initTabs(tabGroupSelector) {
  const group = document.querySelector(tabGroupSelector);
  if (!group) return;

  const buttons = group.querySelectorAll("[data-tab-target]");
  const panels = document.querySelectorAll("[data-tab-panel]");

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.getAttribute("data-tab-target");

      buttons.forEach((b) => {
        b.classList.remove("bg-white", "shadow-sm", "text-slate-900");
        b.classList.add("text-slate-500");
      });
      btn.classList.add("bg-white", "shadow-sm", "text-slate-900");
      btn.classList.remove("text-slate-500");

      panels.forEach((panel) => {
        if (panel.getAttribute("data-tab-panel") === target) {
          panel.classList.remove("hidden");
        } else {
          panel.classList.add("hidden");
        }
      });
    });
  });
}

// Dark mode, persisted to localStorage
export function initDarkMode(toggleId) {
  const toggle = document.getElementById(toggleId);
  const root = document.documentElement;

  const stored = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const isDark = stored ? stored === "dark" : prefersDark;

  root.classList.toggle("dark", isDark);
  if (toggle) toggle.checked = isDark;

  toggle?.addEventListener("change", () => {
    const dark = toggle.checked;
    root.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  });
}
