window.addEventListener("load", function () {
  console.log("cookie-consent.js завантажено"); 

  window.cookieconsent.initialise({
    palette: {
      popup: { background: "#000" },
      button: { background: "#f1d600" }
    },
    position: "bottom-right",
    content: {
      message: "Цей сайт використовує cookie для покращення вашого досвіду.",
      dismiss: "Прийняти всі",
      deny: "Відмовитись",
      link: "Докладніше",
      href: "/privacy-policy.html"
    }
  });
});
