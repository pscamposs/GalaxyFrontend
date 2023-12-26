const authForm = document.getElementById("authForm");

authForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(event.target);
  const formValues = Object.fromEntries(formData);

  try {
    const response = await (formValues.action === "login"
      ? login(formValues)
      : register(formValues));
    const { status, message } = await response.json();

    if (status === "success") {
      Swal.fire({
        title:
          formValues.action === "login"
            ? "Logado com sucesso"
            : "Registrado com sucesso",
        text: "Redirecionando...",
        icon: status,
      }).then(() => {
        window.location.href = formValues.action === "login" ? "../" : "./";
      });
    } else {
      Swal.fire({
        title: "Ops...",
        text: message,
        icon: status,
      });
    }
  } catch (error) {
    console.error(error);
    Swal.fire({
      title: "Erro",
      text: "Ocorreu um erro durante o processamento do seu pedido. Tente novamente mais tarde.",
      icon: "error",
    });
  }
});
