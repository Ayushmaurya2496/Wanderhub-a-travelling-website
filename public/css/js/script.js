(function () {
    'use strict';
    const forms = document.querySelectorAll('.needs-validation');
    Array.from(forms).forEach((form) => {
      form.addEventListener(
        'submit',
        (event) => {
          if (!form.checkValidity()) {
            event.preventDefault();
            event.stopPropagation();
          }
          form.classList.add('was-validated');
        },
        false
      );
    });
  })();
  // 💬 Chatbot Toggle Logic
document.addEventListener("DOMContentLoaded", function () {
  const chatIcon = document.getElementById("chatIcon");
  const chatWindow = document.getElementById("chatWindow");

  if (chatIcon && chatWindow) {
    chatIcon.addEventListener("click", function (e) {
      e.stopPropagation();
      chatWindow.style.display = chatWindow.style.display === "flex" ? "none" : "flex";
    });

    document.addEventListener("click", function (event) {
      const isClickInside = chatWindow.contains(event.target) || chatIcon.contains(event.target);
      if (!isClickInside) {
        chatWindow.style.display = "none";
      }
    });
  }
});
