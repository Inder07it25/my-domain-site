(function () {
  var CATEGORY_LABELS = {
    apps: "Mobile Apps",
    websites: "Websites",
    software: "Custom Software"
  };

  function productHref(product) {
    if (product.linkType === "internal" && product.path) {
      return product.path;
    }
    if (product.linkType === "external" && product.url) {
      return product.url;
    }
    return "";
  }

  function frameClass(category) {
    return category === "apps" ? "phone" : "browser";
  }

  function renderCard(product) {
    var href = productHref(product);
    var image = product.image
      ? '<img class="device-thumb" src="' + escapeHtml(product.image) + '" alt="" />'
      : '<svg class="device-thumb" viewBox="0 0 120 88" aria-hidden="true"><path d="M18 58c16-28 28-8 42-24 14-16 28-8 42 6" fill="none" stroke="#3AA0FF" stroke-width="8" stroke-linecap="round"/><path d="M18 70c18-6 30 8 48-4 16-11 28-4 36 8" fill="none" stroke="#0E3A6B" stroke-width="8" stroke-linecap="round"/></svg>';
    var cta = href
      ? '<a class="product-link" href="' + escapeHtml(href) + '">' + (product.linkType === "internal" ? "Open product" : "Visit site") + "</a>"
      : '<span class="muted-note">Store link coming soon</span>';

    return (
      '<article class="product-card" data-category="' +
      escapeHtml(product.category || "") +
      '">' +
      '<div class="device-frame ' +
      frameClass(product.category) +
      '">' +
      image +
      "</div>" +
      '<div class="product-body">' +
      '<div class="product-cat">' +
      escapeHtml(CATEGORY_LABELS[product.category] || product.category || "Product") +
      "</div>" +
      "<h3>" +
      escapeHtml(product.name || "Untitled") +
      "</h3>" +
      "<p>" +
      escapeHtml(product.description || "") +
      "</p>" +
      cta +
      "</div></article>"
    );
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  async function loadProducts() {
    var response = await fetch("data/products.json", { cache: "no-store" });
    if (!response.ok) {
      throw new Error("Could not load products");
    }
    var data = await response.json();
    return Array.isArray(data.products) ? data.products : [];
  }

  function applyFilter(root, category) {
    root.querySelectorAll(".product-card").forEach(function (card) {
      var match = category === "all" || card.getAttribute("data-category") === category;
      card.hidden = !match;
    });
  }

  window.SisdarProducts = {
    loadProducts: loadProducts,
    renderCard: renderCard,
    applyFilter: applyFilter,
    categoryLabels: CATEGORY_LABELS
  };

  document.querySelectorAll("[data-product-grid]").forEach(function (grid) {
    var featuredOnly = grid.getAttribute("data-featured") === "true";
    var filters = document.querySelector("[data-product-filters]");

    loadProducts()
      .then(function (products) {
        var list = featuredOnly ? products.filter(function (item) { return item.featured; }) : products;
        if (!list.length) {
          grid.innerHTML = '<p class="muted-note">Products will appear here once published.</p>';
          return;
        }
        grid.innerHTML = list.map(renderCard).join("");
      })
      .catch(function () {
        grid.innerHTML = '<p class="muted-note">The product catalog could not be loaded.</p>';
      });

    if (filters) {
      filters.addEventListener("click", function (event) {
        var button = event.target.closest("[data-filter]");
        if (!button) return;
        filters.querySelectorAll("[data-filter]").forEach(function (chip) {
          chip.setAttribute("aria-pressed", chip === button ? "true" : "false");
        });
        applyFilter(grid, button.getAttribute("data-filter"));
      });
    }
  });
})();
