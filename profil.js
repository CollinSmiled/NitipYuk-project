let user = null;

try {
  user = JSON.parse(localStorage.getItem("nitipyuk-user") || "null");
} catch {
  localStorage.removeItem("nitipyuk-user");
}

if (!user) {
  window.location.href =
    "login.html?return=" + encodeURIComponent("profil.html");
} else {
  const photo = document.querySelector("#profile-photo");
  const nameInput = document.querySelector("#profile-name");
  const phoneInput = document.querySelector("#profile-phone");
  const emailInput = document.querySelector("#profile-email");
  const roleLabel = document.querySelector("#profile-role");
  const displayName = document.querySelector("#profile-display-name");
  const shopField = document.querySelector("#shop-field");
  const shopInput = document.querySelector("#profile-shop");
  const photoInput = document.querySelector("#photo-input");
  const profileForm = document.querySelector("#profile-form");
  const saveMessage = document.querySelector("#save-message");
  const authAvatar = document.querySelector(".auth-icon img");

  const role = String(user.role || "").toLowerCase();
  const savedName =
    user.name?.trim() || user.email?.split("@")[0] || "Pengguna";

  nameInput.value = user.name || savedName;
  phoneInput.value = user.phone || "";
  emailInput.value = user.email || "";
  displayName.textContent = savedName;
  roleLabel.textContent = role === "buyer" ? "Buyer" : "Penitip";

  if (user.photo) {
    photo.src = user.photo;

    if (authAvatar) {
      authAvatar.src = user.photo;
      authAvatar.classList.add("is-profile-photo");
    }
  }

  if (role === "penitip") {
    shopField.hidden = false;
    shopInput.value = user.shopName || "";
  }

  let selectedPhotoFile = null;
  let temporaryPhotoUrl = null;

  photoInput.addEventListener("change", () => {
    const file = photoInput.files[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      saveMessage.textContent = "Pilih file gambar untuk foto profil.";
      photoInput.value = "";
      return;
    }

    selectedPhotoFile = file;

    if (temporaryPhotoUrl) {
      URL.revokeObjectURL(temporaryPhotoUrl);
    }

    temporaryPhotoUrl = URL.createObjectURL(file);
    photo.src = temporaryPhotoUrl;
    saveMessage.textContent = "Pratinjau foto siap. Klik Simpan perubahan.";
  });

  function resizePhoto(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onerror = () => reject(new Error("Foto tidak bisa dibaca."));

      reader.onload = () => {
        const image = new Image();

        image.onerror = () =>
          reject(new Error("File bukan gambar yang valid."));

        image.onload = () => {
          const maxSize = 400;
          const scale = Math.min(
            maxSize / image.width,
            maxSize / image.height,
            1,
          );

          const canvas = document.createElement("canvas");
          canvas.width = Math.round(image.width * scale);
          canvas.height = Math.round(image.height * scale);

          const context = canvas.getContext("2d");

          if (!context) {
            reject(new Error("Foto tidak bisa diproses."));
            return;
          }

          context.drawImage(image, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL("image/jpeg", 0.8));
        };

        image.src = reader.result;
      };

      reader.readAsDataURL(file);
    });
  }

  profileForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    user.name = nameInput.value.trim();
    user.phone = phoneInput.value.trim();

    if (role === "penitip") {
      user.shopName = shopInput.value.trim();
    }

    try {
      if (selectedPhotoFile) {
        user.photo = await resizePhoto(selectedPhotoFile);
      }

      localStorage.setItem("nitipyuk-user", JSON.stringify(user));

      displayName.textContent = user.name || "Pengguna";
      saveMessage.textContent = "Perubahan profil berhasil disimpan.";

      if (user.photo && authAvatar) {
        authAvatar.src = user.photo;
        authAvatar.alt = `Foto profil ${user.name}`;
        authAvatar.classList.add("is-profile-photo");
      }

      selectedPhotoFile = null;

      if (temporaryPhotoUrl) {
        URL.revokeObjectURL(temporaryPhotoUrl);
        temporaryPhotoUrl = null;
      }
    } catch (error) {
      saveMessage.textContent =
        error.message || "Perubahan belum bisa disimpan.";
    }
  });
}
