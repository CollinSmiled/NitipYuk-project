const CART_KEY = "nitipyuk-cart";

const products = {
  "tas-mini": {
    name: "Tas mini warna krem",
    country: "🇰🇷 Korea Selatan",
    price: 450000,
    image: "element/bag.jpg",
  },
  "camilan-jepang": {
    name: "Camilan khas Jepang",
    country: "🇯🇵 Jepang",
    price: 85000,
    image: "element/snack.jpg",
  },
  "serum-wajah": {
    name: "Serum perawatan wajah",
    country: "🇰🇷 Korea Selatan",
    price: 180000,
    image: "element/skincare.jpg",
  },
};

function getCart() {
  try {
    const cart = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
    return Array.isArray(cart) ? cart : [];
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function formatRupiah(value) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

/* Fungsi tambah ke keranjang, dipakai di Beranda dan Produk */
document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-add-to-cart]");
  if (!button) return;

  const id = button.dataset.addToCart;
  if (!products[id]) return;

  const cart = getCart();
  const existingItem = cart.find((item) => item.id === id);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      id,
      quantity: 1,
      selected: true,
    });
  }

  saveCart(cart);

  const originalText = button.textContent;
  button.textContent = "Ditambahkan ✓";
  button.disabled = true;

  setTimeout(() => {
    button.textContent = originalText;
    button.disabled = false;
  }, 1000);
});

/* Elemen-elemen halaman keranjang */
const cartContainer = document.querySelector("#cart-items");
const emptyState = document.querySelector("#cart-empty");
const selectAll = document.querySelector("#select-all");
const clearButton = document.querySelector("#clear-cart");
const summaryQuantity = document.querySelector("#summary-quantity");
const summarySubtotal = document.querySelector("#summary-subtotal");
const checkoutButton = document.querySelector("#checkout-button");

function renderCart() {
  if (!cartContainer) return;

  const cart = getCart();
  const selectAllRow = document.querySelector(".cart-select-all");

  cartContainer.replaceChildren();

  const validCart = cart.filter((item) => products[item.id]);

  if (emptyState) emptyState.hidden = validCart.length > 0;
  if (selectAllRow) selectAllRow.hidden = validCart.length === 0;

  validCart.forEach((item) => {
    const product = products[item.id];

    const row = document.createElement("article");
    row.className = "cart-item";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = item.selected !== false;
    checkbox.setAttribute("aria-label", `Pilih ${product.name}`);
    checkbox.addEventListener("change", () => {
      updateItem(item.id, (current) => {
        current.selected = checkbox.checked;
      });
    });

    const image = document.createElement("img");
    image.className = "cart-item-photo";
    image.src = product.image;
    image.alt = product.name;

    const details = document.createElement("div");
    details.className = "cart-item-info";

    const country = document.createElement("p");
    country.className = "cart-item-country";
    country.textContent = product.country;

    const name = document.createElement("h2");
    name.textContent = product.name;

    const price = document.createElement("p");
    price.className = "cart-item-price";
    price.textContent = formatRupiah(product.price);

    details.append(country, name, price);

    const controls = document.createElement("div");
    controls.className = "cart-item-controls";

    const decreaseButton = document.createElement("button");
    decreaseButton.type = "button";
    decreaseButton.textContent = "−";
    decreaseButton.setAttribute("aria-label", `Kurangi ${product.name}`);
    decreaseButton.addEventListener("click", () => {
      updateItem(item.id, (current) => {
        current.quantity = Math.max(1, current.quantity - 1);
      });
    });

    const quantity = document.createElement("span");
    quantity.textContent = item.quantity;

    const increaseButton = document.createElement("button");
    increaseButton.type = "button";
    increaseButton.textContent = "+";
    increaseButton.setAttribute("aria-label", `Tambah ${product.name}`);
    increaseButton.addEventListener("click", () => {
      updateItem(item.id, (current) => {
        current.quantity += 1;
      });
    });

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "cart-item-remove";
    removeButton.textContent = "Hapus";
    removeButton.addEventListener("click", () => {
      saveCart(getCart().filter((current) => current.id !== item.id));
      renderCart();
    });

    controls.append(decreaseButton, quantity, increaseButton, removeButton);

    row.append(checkbox, image, details, controls);
    cartContainer.append(row);
  });

  const selectedItems = validCart.filter((item) => item.selected !== false);

  const quantity = selectedItems.reduce(
    (total, item) => total + Number(item.quantity || 1),
    0,
  );

  const subtotal = selectedItems.reduce(
    (total, item) =>
      total + products[item.id].price * Number(item.quantity || 1),
    0,
  );

  if (summaryQuantity) summaryQuantity.textContent = quantity;
  if (summarySubtotal) summarySubtotal.textContent = formatRupiah(subtotal);

  if (selectAll) {
    selectAll.checked =
      validCart.length > 0 && selectedItems.length === validCart.length;
    selectAll.disabled = validCart.length === 0;
  }

  if (checkoutButton) {
    checkoutButton.disabled = selectedItems.length === 0;
  }
}

function updateItem(id, update) {
  const cart = getCart();
  const item = cart.find((current) => current.id === id);

  if (!item) return;

  update(item);
  saveCart(cart);
  renderCart();
}

selectAll?.addEventListener("change", () => {
  const cart = getCart();
  cart.forEach((item) => {
    item.selected = selectAll.checked;
  });

  saveCart(cart);
  renderCart();
});

clearButton?.addEventListener("click", () => {
  saveCart([]);
  renderCart();
});

checkoutButton?.addEventListener("click", () => {
  const selectedItems = getCart().filter((item) => item.selected !== false);

  if (selectedItems.length === 1) {
    const item = selectedItems[0];

    window.location.href =
      `form.html?barang=${encodeURIComponent(item.id)}` +
      `&jumlah=${encodeURIComponent(item.quantity)}`;
  } else if (selectedItems.length > 1) {
    alert(
      "Untuk sementara, form pesanan hanya memproses satu jenis barang. Pilih satu barang dulu.",
    );
  }
});

renderCart();
