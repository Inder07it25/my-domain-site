(function () {
  var THEME_KEY = "sisdar-theme";

  function currentTheme() {
    return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
  }

  function setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (e) {}
    syncThemeControls(theme);
  }

  function syncThemeControls(theme) {
    var next = theme === "dark" ? "light" : "dark";
    document.querySelectorAll("[data-theme-toggle]").forEach(function (btn) {
      btn.setAttribute("aria-label", "Switch to " + next + " theme");
      btn.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
    });
    document.querySelectorAll('meta[name="theme-color"]').forEach(function (meta) {
      meta.setAttribute("content", theme === "dark" ? "#0B1220" : "#F5F8FC");
    });
  }

  syncThemeControls(currentTheme());

  document.querySelectorAll("[data-theme-toggle]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      setTheme(currentTheme() === "dark" ? "light" : "dark");
    });
  });

  try {
    if (!localStorage.getItem(THEME_KEY)) {
      window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function (event) {
        if (!localStorage.getItem(THEME_KEY)) {
          setTheme(event.matches ? "dark" : "light");
        }
      });
    }
  } catch (e) {}

  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector("#site-nav");
  var page = document.body.getAttribute("data-page");

  if (nav) {
    nav.querySelectorAll("a[data-nav]").forEach(function (link) {
      if (link.getAttribute("data-nav") === page) {
        link.setAttribute("aria-current", "page");
      }
    });
  }

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.textContent = open ? "Close" : "Menu";
    });
  }
})();
