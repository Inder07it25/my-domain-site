(function () {
  var EMAIL = "sisdarapps@gmail.com";
  var EMAIL_HASH = "3734455c8db0d54365a2e96e1a94ae794df0f5f1e908300108edeedba01d3faa";
  var PASSWORD_HASH = "8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918";
  var REPO = "Inder07it25/my-domain-site";
  var FILE_PATH = "data/products.json";
  var SESSION_KEY = "sisdar-admin";
  var TOKEN_KEY = "sisdar-github-token";

  var loginView = document.querySelector("#login-view");
  var adminView = document.querySelector("#admin-view");
  var loginForm = document.querySelector("#login-form");
  var productForm = document.querySelector("#product-form");
  var tokenForm = document.querySelector("#token-form");
  var listEl = document.querySelector("#product-list");
  var statusEl = document.querySelector("#admin-status");
  var logoutBtn = document.querySelector("#logout-btn");
  var newBtn = document.querySelector("#new-product-btn");
  var editingId = "";
  var products = [];

  function setStatus(message, isError) {
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.hidden = !message;
    statusEl.style.color = isError ? "#9b1c1c" : "inherit";
  }

  async function sha256(value) {
    var encoded = new TextEncoder().encode(value);
    var digest = await crypto.subtle.digest("SHA-256", encoded);
    return Array.from(new Uint8Array(digest))
      .map(function (byte) {
        return byte.toString(16).padStart(2, "0");
      })
      .join("");
  }

  function uid() {
    return "p-" + Math.random().toString(36).slice(2, 10);
  }

  function isLoggedIn() {
    return sessionStorage.getItem(SESSION_KEY) === "1";
  }

  function showViews() {
    var loggedIn = isLoggedIn();
    if (loginView) loginView.hidden = loggedIn;
    if (adminView) adminView.hidden = !loggedIn;
  }

  function productFromForm() {
    var form = new FormData(productForm);
    var linkType = String(form.get("linkType") || "none");
    return {
      id: editingId || uid(),
      name: String(form.get("name") || "").trim(),
      category: String(form.get("category") || "apps"),
      description: String(form.get("description") || "").trim(),
      image: String(form.get("image") || "").trim(),
      linkType: linkType,
      path: linkType === "internal" ? String(form.get("path") || "").trim() : "",
      url: linkType === "external" ? String(form.get("url") || "").trim() : "",
      featured: form.get("featured") === "on"
    };
  }

  function fillForm(product) {
    editingId = product.id || "";
    productForm.elements.name.value = product.name || "";
    productForm.elements.category.value = product.category || "apps";
    productForm.elements.description.value = product.description || "";
    productForm.elements.image.value = product.image || "";
    productForm.elements.linkType.value = product.linkType || "none";
    productForm.elements.path.value = product.path || "";
    productForm.elements.url.value = product.url || "";
    productForm.elements.featured.checked = Boolean(product.featured);
  }

  function renderList() {
    if (!listEl) return;
    if (!products.length) {
      listEl.innerHTML = '<p class="muted-note">No products yet. Add the first one.</p>';
      return;
    }
    listEl.innerHTML = products
      .map(function (product) {
        return (
          '<div class="admin-row" data-id="' +
          product.id +
          '"><div><strong>' +
          (product.name || "Untitled") +
          "</strong><div class=\"muted-note\">" +
          (window.SisdarProducts.categoryLabels[product.category] || product.category) +
          (product.featured ? " · Featured" : "") +
          "</div></div>" +
          '<button class="button button-ghost" type="button" data-edit>Edit</button>' +
          '<button class="button button-danger" type="button" data-delete>Delete</button></div>'
        );
      })
      .join("");
  }

  async function loadLocalCatalog() {
    products = await window.SisdarProducts.loadProducts();
    renderList();
  }

  function token() {
    return sessionStorage.getItem(TOKEN_KEY) || "";
  }

  async function githubRequest(method, body) {
    var auth = token();
    if (!auth) {
      throw new Error("Add a GitHub token before publishing.");
    }
    var response = await fetch("https://api.github.com/repos/" + REPO + "/contents/" + FILE_PATH, {
      method: method,
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: "Bearer " + auth
      },
      body: body ? JSON.stringify(body) : undefined
    });
    var payload = await response.json();
    if (!response.ok) {
      throw new Error(payload.message || "GitHub request failed");
    }
    return payload;
  }

  function toBase64(text) {
    return btoa(unescape(encodeURIComponent(text)));
  }

  if (loginForm) {
    loginForm.addEventListener("submit", async function (event) {
      event.preventDefault();
      var email = String(loginForm.elements.email.value || "").trim().toLowerCase();
      var password = String(loginForm.elements.password.value || "");
      var emailHash = await sha256(email);
      var passwordHash = await sha256(password);
      if (email !== EMAIL || emailHash !== EMAIL_HASH || passwordHash !== PASSWORD_HASH) {
        setStatus("Those credentials are not recognized.", true);
        return;
      }
      sessionStorage.setItem(SESSION_KEY, "1");
      setStatus("");
      showViews();
      loadLocalCatalog();
    });
  }

  if (tokenForm) {
    tokenForm.elements.token.value = token();
    tokenForm.addEventListener("submit", function (event) {
      event.preventDefault();
      var value = String(tokenForm.elements.token.value || "").trim();
      if (!value) {
        sessionStorage.removeItem(TOKEN_KEY);
        setStatus("GitHub token cleared from this session.");
        return;
      }
      sessionStorage.setItem(TOKEN_KEY, value);
      setStatus("Token saved in this browser session only.");
    });
  }

  if (productForm) {
    productForm.addEventListener("submit", function (event) {
      event.preventDefault();
      var next = productFromForm();
      if (!next.name) {
        setStatus("A product name is required.", true);
        return;
      }
      var index = products.findIndex(function (item) {
        return item.id === next.id;
      });
      if (index >= 0) {
        products[index] = next;
      } else {
        products.push(next);
      }
      fillForm({ id: "", category: "apps", linkType: "none" });
      renderList();
      setStatus("Draft updated. Publish to GitHub so visitors can see it.");
    });
  }

  if (newBtn) {
    newBtn.addEventListener("click", function () {
      fillForm({ id: "", category: "apps", linkType: "none" });
    });
  }

  if (listEl) {
    listEl.addEventListener("click", function (event) {
      var row = event.target.closest(".admin-row");
      if (!row) return;
      var product = products.find(function (item) {
        return item.id === row.getAttribute("data-id");
      });
      if (!product) return;
      if (event.target.closest("[data-edit]")) {
        fillForm(product);
      }
      if (event.target.closest("[data-delete]")) {
        products = products.filter(function (item) {
          return item.id !== product.id;
        });
        renderList();
        setStatus("Product removed from the draft. Publish to make this live.");
      }
    });
  }

  var publishBtn = document.querySelector("#publish-btn");
  if (publishBtn) {
    publishBtn.addEventListener("click", async function () {
      try {
        setStatus("Publishing catalog…");
        var current = await githubRequest("GET");
        var json = JSON.stringify({ products: products }, null, 2) + "\n";
        await githubRequest("PUT", {
          message: "Update SISdar Apps product catalog",
          content: toBase64(json),
          sha: current.sha
        });
        setStatus("Published. The live site usually updates within a minute.");
      } catch (error) {
        setStatus(error.message, true);
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
      sessionStorage.removeItem(SESSION_KEY);
      showViews();
      setStatus("");
    });
  }

  showViews();
  if (isLoggedIn()) {
    loadLocalCatalog();
  }
})();
