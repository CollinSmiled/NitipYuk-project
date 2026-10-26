const params = new URLSearchParams(window.location.search);
const requestedReturn = params.get("return") || "NitipYuk.html";

const allowedReturn =
  /^(NitipYuk\.html|produk\.html|pesanan\.html|form\.html|payment\.html|profil\.html|alamat\.html|keranjang\.html|notif\.html|berhasil\.html|profile\.html|seller\.html|seller-trip\.html|seller-pesanan\.html|seller-pendapatan\.html|seller-pesan\.html|seller-notif\.html|seller-profil\.html|seller-toko\.html|seller-rekening\.html|toko\.html)(\?[\w=&%-]*)?$/.test(
    requestedReturn,
  )
    ? requestedReturn
    : "NitipYuk.html";

const form = document.querySelector("#register-form");
const emailInput = document.querySelector("#email");
const passwordInput = document.querySelector("#password");
const confirmInput = document.querySelector("#confirm-password");
const shopField = document.querySelector("#shop-field");
const shopInput = document.querySelector("#shop-name");
const identityField = document.querySelector("#identity-field");
const identityInput = document.querySelector("#identity-document");

document.querySelector("#login-link").href =
  "login.html?return=" + encodeURIComponent(allowedReturn);

function updateRoleFields() {
  const role = form.querySelector('input[name="role"]:checked').value;
  const isPenitip = role === "penitip";

  shopField.hidden = !isPenitip;
  identityField.hidden = !isPenitip;

  shopInput.required = isPenitip;
  identityInput.required = isPenitip;
}

function validateGmail() {
  const email = emailInput.value.trim();
  const valid = /^[A-Z0-9._%+-]+@gmail\.com$/i.test(email);

  emailInput.setCustomValidity(
    email && !valid ? "Gunakan email yang berakhiran @gmail.com." : "",
  );
}

function validatePasswordMatch() {
  const mismatch =
    confirmInput.value && confirmInput.value !== passwordInput.value;

  confirmInput.setCustomValidity(
    mismatch ? "Konfirmasi password belum sama." : "",
  );
}

form.querySelectorAll('input[name="role"]').forEach((radio) => {
  radio.addEventListener("change", updateRoleFields);
});

emailInput.addEventListener("input", validateGmail);
passwordInput.addEventListener("input", validatePasswordMatch);
confirmInput.addEventListener("input", validatePasswordMatch);

if (allowedReturn.startsWith("seller")) {
  form.querySelector('input[name="role"][value="penitip"]').checked = true;
}
updateRoleFields();

form.addEventListener("submit", (event) => {
  event.preventDefault();

  validateGmail();
  validatePasswordMatch();

  if (!form.reportValidity()) {
    return;
  }

  const role = form.querySelector('input[name="role"]:checked').value;

  const user = {
    name: document.querySelector("#name").value.trim(),
    phone: document.querySelector("#phone").value.trim(),
    email: emailInput.value.trim(),
    role,
  };

  if (role === "penitip") {
    user.shopName = shopInput.value.trim();
  }

  // Demo saja: jangan simpan password atau file KTP di localStorage.
  localStorage.setItem("nitipyuk-user", JSON.stringify(user));

  localStorage.setItem('nitipyuk-profile:' + user.email.toLowerCase(), JSON.stringify(user));
  let destination = role === 'penitip' ? 'seller.html' : allowedReturn;

  // Penitip tidak diteruskan ke form pemesanan Buyer.
  if (role === "penitip" && (destination.startsWith("form.html") || destination.startsWith("payment.html"))) {
    destination = "produk.html";
  }

  window.location.href = destination;
});
