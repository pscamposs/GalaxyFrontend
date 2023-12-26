const API_URL = "https://api.pscampos.online";

const formatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

let navbarComponent = document.querySelector(".menu-content");

document.addEventListener("DOMContentLoaded", async () => {
  if (navbarComponent) {
    let sidebarButtonComponent = document.querySelector(".fa-bars");
    sidebarButtonComponent.addEventListener("click", () => {
      navbarComponent.classList.toggle("show");
    });
  }
});

const download = async (id) => {
  const url = `${API_URL}/plugin/${id}`;
  const link = document.createElement("a");
  link.href = url;
  link.target = "_self";
  link.click();
  window.URL.revokeObjectURL(url);
  document.body.appendChild(link);
  link.remove();
};

const fetchGeneralInfo = async () => {
  const response = await fetch(`${API_URL}/admin/general/`, {
    credentials: "include",
  });

  return response.json();
};

const fetchProfile = async () => {
  const response = await fetch(`${API_URL}/user/profile`, {
    method: "GET",
    credentials: "include",
  });
  return response.json();
};

const fetchPlugins = async (filter = "") => {
  const response = await fetch(`${API_URL}/plugins/${filter}`, {
    method: "POST",
  });
  return response.json();
};

const fetchUserPlugins = async (filter = "") => {
  const response = await fetch(`${API_URL}/user/plugins/${filter}`, {
    method: "POST",
    credentials: "include",
  });
  return response.json();
};

const update = async (plugin) => {
  const response = await fetch(`${API_URL}/plugin/${plugin.id}`, {
    method: "PUT",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(plugin),
  });
  return response.json();
};

const deletePlugin = async (id) => {
  const response = await fetch(`${API_URL}/plugin/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  return response.json();
};

const create = async (plugin) => {
  const response = await fetch(`${API_URL}/plugin`, {
    method: "POST",
    credentials: "include",
    body: plugin,
  });
  return response.json();
};

const login = async (credentials) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });
  return response;
};

const register = async (user) => {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(user),
  });
  return response;
};

const logout = async () => {
  await fetch(`${API_URL}/auth/logout`, {
    method: "POST",
    credentials: "include",
  });
  window.location.href = "../";
};
