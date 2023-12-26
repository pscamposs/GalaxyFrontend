const pluginsContainer = document.getElementsByClassName("box-plugins-list")[0];

document.addEventListener("DOMContentLoaded", async () => {
  fetchProfile()
    .catch((err) => {
      return (window.location.href = "../auth");
    })
    .finally(() => {
      updateFilters();
      updatePlugins();
    });
});

const updatePlugins = async (filter) => {
  pluginsContainer.innerHTML = "";

  let plugins = await fetchUserPlugins(filter);

  if (plugins.length === 0) {
    pluginsContainer.innerHTML += `<h1>Nada para mostrar</h1>`;
  } else {
    plugins.forEach((plugin) => {
      pluginsContainer.appendChild(createPluginsCard(plugin));
    });
  }
};

const updateFilters = () => {
  const categoryLinks = document.querySelectorAll(".box-filter ul li a");

  categoryLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      let filter = link.dataset.filter || "";
      updatePlugins(filter.toLowerCase());

      categoryLinks.forEach((item) => {
        item.classList.remove("selected");
      });
      link.classList.add("selected");
    });
  });
};

const createCardImage = (imageUrl) => {
  const cardImage = document.createElement("div");
  cardImage.classList.add("card-image");
  cardImage.innerHTML = `<img src="${imageUrl}" alt="Default Plugin" />`;
  return cardImage;
};

const createCardTitle = (name, price) => {
  const cardTitle = document.createElement("div");
  cardTitle.classList.add("card-title");
  cardTitle.innerHTML = `<h2>${name}</h2>`;
  cardTitle.innerHTML += `<p><a href="#">Configurar</a></p>`;
  return cardTitle;
};

const createCardFooter = (plugin) => {
  const cardFooter = document.createElement("div");
  cardFooter.classList.add("card-footer");
  const cardButton = document.createElement("button");
  cardButton.innerText = "Baixar";
  cardButton.addEventListener("click", () => download(plugin._id));
  cardFooter.appendChild(cardButton);
  return cardFooter;
};

const createPluginsCard = (plugin) => {
  const card = document.createElement("div");
  card.classList.add("card");

  const cardImage = createCardImage(plugin.image);
  const cardTitle = createCardTitle(plugin.name, plugin.price);
  const cardFooter = createCardFooter(plugin);

  card.appendChild(cardImage);
  card.appendChild(cardTitle);
  card.appendChild(cardFooter);

  return card;
};
