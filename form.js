function readStorage(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "null");
    return value ?? fallback;
  } catch {
    return fallback;
  }
}

const user = readStorage("nitipyuk-user", null);

if (!user || String(user.role || "").toLowerCase() !== "buyer") {
  const currentPage =
    window.location.pathname.split("/").pop() + window.location.search;

  window.location.href = "login.html?return=" + encodeURIComponent(currentPage);
} else {
  const form = document.querySelector("#request-form");
  const message = document.querySelector("#request-message");
  const selectedItemName = document.querySelector("#selected-item-name");
  const selectedItemCountry = document.querySelector("#selected-item-country");
  const addressSelect = document.querySelector("#shipping-address");

  const products = {
    "tas-mini": {
      name: "Tas mini warna krem",
      country: "🇰🇷 Korea Selatan",
    },
    "camilan-jepang": {
      name: "Camilan khas Jepang",
      country: "🇯🇵 Jepang",
    },
    "serum-wajah": {
      name: "Serum perawatan wajah",
      country: "🇰🇷 Korea Selatan",
    },
  };

  const params = new URLSearchParams(window.location.search);
  const itemId = params.get("barang");
  const product = products[itemId];

  if (product) {
    selectedItemName.textContent = product.name;
    selectedItemCountry.textContent = product.country;
  } else {
    selectedItemName.textContent = "Barang tidak ditemukan";
    selectedItemCountry.textContent =
      "Silakan kembali ke katalog dan pilih barang.";
  }

  // Mengambil alamat tersimpan dari halaman Alamat.
  // Format yang dibaca: nitipyuk-addresses = array alamat.
  const savedAddresses = readStorage("nitipyuk-addresses", []);
  const addresses = Array.isArray(savedAddresses) ? savedAddresses : [];
  const addressById = new Map();

  addresses.forEach((address, index) => {
    const addressObject =
      typeof address === "string"
        ? { id: String(index), label: address, address }
        : address;

    const addressId = String(addressObject.id ?? index);
    const addressText =
      addressObject.label ||
      addressObject.name ||
      addressObject.address ||
      "Alamat tersimpan";

    addressById.set(addressId, addressObject);

    const option = document.createElement("option");
    option.value = addressId;
    option.textContent = addressText;
    addressSelect.appendChild(option);
  });

  if (addresses.length === 0) {
    const emptyOption = document.createElement("option");
    emptyOption.value = "";
    emptyOption.textContent = "Belum ada alamat tersimpan";
    emptyOption.disabled = true;
    addressSelect.appendChild(emptyOption);
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    message.textContent = "";

    if (!product) {
      message.textContent = "Pilih barang dari katalog terlebih dahulu.";
      return;
    }

    const address = addressById.get(addressSelect.value);

    if (!address) {
      message.textContent =
        "Pilih alamat pengiriman yang sudah tersimpan terlebih dahulu.";
      return;
    }

    const order = {
      id: "NY-" + Date.now(),
      userEmail: user.email || "",
      itemId,
      itemName: product.name,
      country: product.country,
      quantity: Number(document.querySelector("#item-quantity").value),
      notes: document.querySelector("#item-notes").value.trim(),
      shippingAddress: address,
      status: "Dikonfirmasi",
      createdAt: new Date().toISOString(),
    };

    const orders = readStorage("nitipyuk-orders", []);
    const safeOrders = Array.isArray(orders) ? orders : [];

    safeOrders.push(order);
    localStorage.setItem("nitipyuk-orders", JSON.stringify(safeOrders));

    message.textContent = "Pesanan titipan berhasil dibuat.";
  });
}
