const pluginsTable = document.getElementsByTagName("table")[0];
const pluginsTableBody = pluginsTable.getElementsByTagName("tbody")[0];

let modal = document.getElementById("pluginModal");
let modalContent = document.getElementsByClassName("modal-content")[0];

let span = document.getElementsByClassName("close")[0];
let form = document.getElementById("pluginForm");
let formContainer = document.getElementsByClassName("pluginForm")[0];
let formData = document.getElementById("formLeft");

document.addEventListener("DOMContentLoaded", async () => {
  fetchProfile()
    .then(async (res) => {
      let { user } = res;
      if (!user.roles.includes("ADMIN"))
        return (window.location.href = "../auth");
    })
    .catch((err) => {
      return (window.location.href = "../auth");
    })
    .finally(() => {
      updateGeneralInfo();
      updatePluginList();
      initTiny();
    });
});

const updateGeneralInfo = async () => {
  let { plugins, payments, users, totalSales } = await fetchGeneralInfo();
  document.getElementById("registeredProducts").innerText = plugins;
  document.getElementById("registeredSales").innerText = payments;
  document.getElementById("registeredUsers").innerText = users;
  document.getElementById("totalSales").innerText =
    formatter.format(totalSales);
};

const initTiny = () => {
  tinymce.init({
    selector: "textarea",
    plugins:
      "mentions anchor autolink charmap codesample emoticons image link lists media searchreplace table visualblocks wordcount checklist mediaembed casechange export formatpainter pageembed permanentpen footnotes advtemplate advtable advcode editimage tableofcontents mergetags powerpaste tinymcespellchecker autocorrect a11ychecker typography inlinecss",
    toolbar:
      "undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table mergetags | align lineheight  | checklist numlist bullist indent outdent | emoticons charmap | removeformat",
  });
};

const updatePluginList = async () => {
  let plugins = await fetchPlugins();
  pluginsTableBody.innerHTML = "";
  plugins.forEach((plugin) => {
    let tr = document.createElement("tr");
    tr.innerHTML += `<td>${plugin._id}</td>`;
    tr.innerHTML += `<td>${plugin.name}</td>`;
    tr.innerHTML += `<td>${formatter.format(plugin.price)}</td>`;
    tr.innerHTML += `<td>${plugin.downloads}</td>`;

    let actionTd = document.createElement("td");
    let editButton = document.createElement("button");
    editButton.innerText = "Editar";
    editButton.addEventListener("click", () => editPlugin(plugin));

    let deleteButton = document.createElement("button");
    deleteButton.innerText = "Deletar   ";
    deleteButton.addEventListener("click", () => removePlugin(plugin._id));

    actionTd.appendChild(editButton);
    actionTd.appendChild(deleteButton);

    tr.appendChild(actionTd);
    pluginsTableBody.appendChild(tr);
  });
};

const removePlugin = async (id) => {
  Swal.fire({
    title: "Deseja deletar esse plugin?",

    showDenyButton: true,
    confirmButtonText: "Confirmar",
    denyButtonText: `Cancelar`,
  }).then((result) => {
    if (result.isConfirmed) {
      deletePlugin(id);
    }
  });
};

const action = document.getElementById("action");
let cancel = document.createElement("input");
const id = document.getElementById("id");
const name = document.getElementById("name");
const description = document.getElementById("html");
const image = document.getElementById("image");
const file = document.getElementById("file");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const description = tinymce.get("html").getContent();
  formData.set("description", description);

  formData.delete("id");
  formData.delete("action");

  if (image.value === "") formData.delete("image");
  if (description === "") formData.delete("description");
  if (file.files.length === 0) formData.delete("file");

  let response;

  if (action.value === "edit") {
    const updated = Object.fromEntries(formData);
    response = await update({
      id: document.getElementById("id").value,
      updated,
    });
  } else {
    response = await create(formData);
  }

  if (response.status === "success") {
    Swal.fire({
      title: "Sucesso",
      text: response.message,
      icon: response.status,
    }).then((result) => {
      updatePluginList();
      cancelEdit();
    });
  } else {
    Swal.fire({
      title: "Erro",
      text: response.message,
      icon: response.status,
    }).then((result) => {
      updatePluginList();
      cancelEdit();
    });
  }
});

const cancelEdit = () => {
  action.value = "send";
  file.setAttribute("required", true);

  formContainer.getElementsByTagName("h2")[0].innerText = "Enviar Plugin";
  form.reset();
};

const editPlugin = (plugin) => {
  action.value = "edit";
  file.removeAttribute("required");
  formContainer.getElementsByTagName("h2")[0].innerText = "Editando Plugin";
  id.value = plugin._id;
  cancel.type = "reset";
  cancel.value = "Cancelar";
  cancel.addEventListener("click", (e) => cancelEdit());
  formData.appendChild(cancel);

  const price = document.getElementById("price");
  name.value = plugin.name;
  image.value = plugin.image;
  price.value = plugin.price;
  description.value = plugin.description;

  tinymce.get("html").setContent(plugin.description || "");
};
