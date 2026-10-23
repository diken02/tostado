const toggle = document.querySelector(".nav-toggle");
const nav = document.querySelector(".main-nav");
toggle?.addEventListener("click", () => {
  const expanded = toggle.getAttribute("aria-expanded") === "true";
  toggle.setAttribute("aria-expanded", String(!expanded));
  nav?.classList.toggle("main-nav--open", !expanded);
});

const typeSelect = document.querySelector("[data-order-type]");
const tableField = document.querySelector("[data-table-field]");
const updateTableField = () => {
  tableField?.classList.toggle("is-hidden", typeSelect?.value !== "local");
};
typeSelect?.addEventListener("change", updateTableField);
updateTableField();

const categoryFilters = document.querySelectorAll("[data-category-filter]");
const menuCategories = document.querySelectorAll("[data-menu-category]");
categoryFilters.forEach((filter) => {
  filter.addEventListener("click", () => {
    const selectedCategory = filter.dataset.categoryFilter;
    categoryFilters.forEach((item) => item.classList.toggle("is-active", item === filter));
    menuCategories.forEach((section) => {
      section.classList.toggle("is-hidden", section.dataset.menuCategory !== selectedCategory);
    });
  });
});

const quantityInputs = document.querySelectorAll("[data-order-quantity]");
const orderCounts = document.querySelectorAll("[data-order-count]");
const orderTotals = document.querySelectorAll("[data-order-total]");
const mobileOrderButton = document.querySelector(".mobile-order-button");
const updateOrderSummary = () => {
  let count = 0;
  let total = 0;

  quantityInputs.forEach((input) => {
    const quantity = Math.max(0, Number(input.value) || 0);
    const price = Number(input.dataset.unitPrice.replace(",", ".")) || 0;
    count += quantity;
    total += quantity * price;
  });

  orderCounts.forEach((element) => {
    element.textContent = String(count);
  });
  orderTotals.forEach((element) => {
    element.textContent = `$${new Intl.NumberFormat("es-CO", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(total)}`;
  });
  mobileOrderButton?.classList.toggle("is-visible", count > 0);
};

quantityInputs.forEach((input) => {
  input.addEventListener("input", updateOrderSummary);
});

document.querySelectorAll("[data-quantity-step]").forEach((button) => {
  button.addEventListener("click", () => {
    const input = button.parentElement?.querySelector("[data-order-quantity]");
    if (!input) return;

    const current = Number(input.value) || 0;
    const minimum = Number(input.min) || 0;
    const maximum = Number(input.max) || Number.POSITIVE_INFINITY;
    const step = Number(button.dataset.quantityStep) || 0;
    input.value = String(Math.min(maximum, Math.max(minimum, current + step)));
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
});

updateOrderSummary();
