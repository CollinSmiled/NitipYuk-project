let user = null;

try {
  user = JSON.parse(localStorage.getItem("nitipyuk-user") || "null");
} catch {
  localStorage.removeItem("nitipyuk-user");
}

const role = String(user?.role || "").toLowerCase();
const isBuyer = Boolean(user && role === "buyer");

// Nama akun di navbar membuka halaman Profil.
const authLink = document.querySelector(".auth-link");

if (user && authLink) {
  const name = user.name || user.email?.split("@")[0] || "Akun saya";
  const label = authLink.querySelector("span:last-child");

  if (label) {
    label.textContent = name;
  }

  authLink.href = "profil.html";
}

// Arahkan tombol titip berdasarkan status login Buyer.
document.querySelectorAll(".product-link[data-item]").forEach((link) => {
  const formPage =
    "form-titipan.html?barang=" + encodeURIComponent(link.dataset.item);

  link.href = isBuyer
    ? formPage
    : "login.html?return=" + encodeURIComponent(formPage);

  link.addEventListener("click", (event) => {
    event.preventDefault();
    window.location.href = link.href;
  });
});

// Ganti tampilan Pesanan berdasarkan status login Buyer.
const guestOrders = document.querySelector("#orders-guest");
const buyerOrders = document.querySelector("#orders-buyer");

if (isBuyer) {
  if (guestOrders) guestOrders.hidden = true;
  if (buyerOrders) buyerOrders.hidden = false;
}
