const pluginListContainer = document.querySelector(".box-plugins-list");
const cartModalElement = document.getElementById("cartModal");
const pluginCartList = document.getElementById("cartPlugins");
const checkoutContainer = document.getElementById("cartCheckout");
const cartButtonElement = document.getElementById("cart");
const cartButtonCloseElement = document.getElementById("cartClose");

cartButtonElement.addEventListener("click", () => {
  toggleModal();
});

cartButtonCloseElement.addEventListener("click", () => {
  toggleModal();
});

const toggleModal = () => {
  cartModalElement.classList.toggle("modal-active");
  if (cartModalElement.classList.contains("modal-active")) {
    cartModalElement.style.right = 0;
  } else {
    cartModalElement.style.right = "-999px";
  }
};

document.addEventListener("DOMContentLoaded", async () => {
  const cart = getCart();

  if (cart.length > 0) {
    document.getElementById("cartItems").innerText = cart.length;
  } else {
    pluginCartList.innerHTML += "<h3>Nenhum produto</h3>";
  }

  updateCartModal();
  await updateFilters();
  await updatePlugins();
});

async function updatePlugins(filter) {
  pluginListContainer.innerHTML = "";

  try {
    const plugins = await fetchPlugins(filter);

    if (plugins.length === 0) {
      pluginListContainer.innerHTML += `<h1>Nada para mostrar</h1>`;
    } else {
      plugins.forEach((plugin) => {
        pluginListContainer.appendChild(createPluginsCard(plugin));
      });
    }
  } catch (error) {
    console.error(error);
  }
}

async function updateFilters() {
  const categoryLinks = document.querySelectorAll(".box-filter ul li a");

  categoryLinks.forEach((link) => {
    link.addEventListener("click", async (event) => {
      event.preventDefault();

      const filter = link.dataset.filter || "";
      await updatePlugins(filter.toLowerCase());

      categoryLinks.forEach((item) => {
        item.classList.remove("selected");
      });
      link.classList.add("selected");
    });
  });
}

function createImage(imageUrl) {
  const image = document.createElement("img");
  image.src = imageUrl;
  image.alt = "Plugin Image";
  return image;
}

function createTitle(name, price) {
  const title = document.createElement("h2");
  title.innerText = name;
  const priceElement = document.createElement("p");
  priceElement.innerText = price > 0 ? formatter.format(price) : "Gratuito";
  title.appendChild(priceElement);
  return title;
}

function createButton(plugin) {
  const button = document.createElement("button");
  button.innerText = plugin.price > 0 ? "Comprar" : "Baixar";
  button.addEventListener("click", () => {
    if (plugin.price > 0) {
      addToCart(plugin);
    } else {
      downloadPlugin(plugin._id);
    }
  });
  return button;
}

function createPluginsCard(plugin) {
  const card = document.createElement("div");
  card.classList.add("card");

  const image = createImage(plugin.image);
  image.addEventListener("click", () => openModal(plugin));
  const title = createTitle(plugin.name, plugin.price);
  const button = createButton(plugin);

  card.appendChild(image);
  card.appendChild(title);
  card.appendChild(button);

  return card;
}

let modal;

function openModal(plugin) {
  if (!modal) {
    modal = document.createElement("div");
    modal.classList.add("modal");
    document.body.appendChild(modal);

    modal.addEventListener("click", (event) => {
      if (
        event.target.classList.contains("modal") ||
        event.target.classList.contains("close")
      ) {
        closeModal();
      }
    });
  }

  modal.innerHTML = `
<div class="modal-content">
<span class="close">&times;</span>
  <div class="modal-header">
    <img src="${plugin.image}" alt="pluginImage">
    <div>
      <h1></span>${plugin.name}</h1>
      <p>Downloads: <span class="math-inline">${plugin.downloads}</p>
    </div>
  </div>
  <div class="modal-description"></span>${plugin.description}</div>
</div>
`;

  modal.classList.add("modal-active");

  const closeButton = modal.querySelector(".close");
  closeButton.addEventListener("click", () => closeModal());
}

const closeModal = () => {
  if (modal) {
    modal.classList.remove("modal-active");
  }
};

function isInCart(productId) {
  const cart = getCart();
  return cart.some((e) => e._id === productId);
}
function addToCart(plugin) {
  if (!isInCart(plugin._id)) {
    const cart = getCart();
    cart.push(plugin);
    updateCart(cart);
    document.getElementById("cartItems").innerText = getCart().length;
  }
}

function removeFromCart(productId) {
  let cart = getCart();
  if (isInCart(productId)) {
    cart = cart.filter((item) => item._id !== productId);
    updateCart(cart);
  }
}
function getCart() {
  const cart = localStorage.getItem("cart");
  return cart ? JSON.parse(cart) : [];
}

function updateCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartModal();
}

const updateCartModal = () => {
  pluginCartList.innerHTML = "";
  let totalPrice = 0;
  let discount = 0;

  getCart().forEach((plugin) => {
    totalPrice += plugin.price;
    const newPluginCart = document.createElement("div");
    newPluginCart.classList.add("pluginCart");

    const pluginImage = document.createElement("img");
    pluginImage.src = plugin.image;
    pluginImage.alt = "pluginImage";
    newPluginCart.appendChild(pluginImage);

    const pluginCartTitle = document.createElement("div");
    pluginCartTitle.classList.add("pluginCartTitle");

    const pluginName = document.createElement("h3");
    pluginName.textContent = plugin.name;
    pluginCartTitle.appendChild(pluginName);

    const pluginPrice = document.createElement("p");
    pluginPrice.textContent = formatter.format(plugin.price);
    pluginCartTitle.appendChild(pluginPrice);

    newPluginCart.appendChild(pluginCartTitle);
    pluginCartList.appendChild(newPluginCart);

    const trashIcon = document.createElement("i");
    trashIcon.classList.add("fa", "fa-trash");
    trashIcon.addEventListener("click", () => removeFromCart(plugin._id));
    newPluginCart.appendChild(trashIcon);
  });

  checkoutContainer.innerHTML = `
  <p>Total: ${formatter.format(totalPrice)}</p>
  <p>Desconto: ${formatter.format(discount)}</p>
  <h3>SubTotal: ${formatter.format(Math.max(totalPrice - discount, 0))}</h3>
  `;

  if (totalPrice > 0) {
    let button = document.createElement("button");
    button.innerText = "Finalizar Compra";
    button.addEventListener("click", () => checkout());
    button.id = "buttonCheckout";
    checkoutContainer.appendChild(button);
  }
};

const checkout = () => {
  if (getCart().length === 0) return;

  let cart = [];

  getCart().forEach((plugin) => {
    cart.push(plugin._id);
  });

  fetch(`${API_URL}/api/purchase`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      cart,
    }),
  })
    .then(async (res) => {
      let response = await res.json();
      localStorage.removeItem("cart");
      let button = document.getElementById("buttonCheckout");
      button.setAttribute("disabled", true);
      window.open(response.url, "_self");
    })
    .catch((e) => {
      window.location.href = "./auth/";
    });
};
