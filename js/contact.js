(function () {
  var form = document.getElementById("contact-form");
  if (!form) return;

  var statusEl = document.getElementById("contact-status");
  var submitBtn = document.getElementById("contact-submit");
  var endpoint = "https://formsubmit.co/ajax/sisdarapps@gmail.com";

  function setStatus(message, kind) {
    if (!statusEl) return;
    statusEl.hidden = !message;
    statusEl.textContent = message || "";
    statusEl.classList.remove("is-success", "is-error");
    if (kind) statusEl.classList.add(kind === "success" ? "is-success" : "is-error");
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    var name = form.elements.name.value.trim();
    var email = form.elements.email.value.trim();
    var topic = form.elements.topic.value;
    var message = form.elements.message.value.trim();
    var honey = form.elements._gotcha ? form.elements._gotcha.value : "";

    if (honey) {
      setStatus("Message sent. Thank you.", "success");
      form.reset();
      return;
    }

    if (!name || !email || !message) {
      setStatus("Please fill in name, email, and message.", "error");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus("Please enter a valid email address.", "error");
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Sending…";
    setStatus("Sending your message…");

    var payload = {
      name: name,
      email: email,
      topic: topic,
      message: message,
      _subject: "SISdar Apps contact: " + topic,
      _template: "table",
      _replyto: email,
      _honey: ""
    };

    fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify(payload)
    })
      .then(function (response) {
        return response.json().catch(function () {
          return {};
        }).then(function (data) {
          if (!response.ok) {
            var err = (data && (data.message || data.error)) || "Could not send your message.";
            throw new Error(err);
          }
          return data;
        });
      })
      .then(function () {
        form.reset();
        setStatus("Message sent. We will reply to your email within 48 hours.", "success");
      })
      .catch(function (error) {
        setStatus(error.message || "Could not send your message. Please try again or email sisdarapps@gmail.com.", "error");
      })
      .finally(function () {
        submitBtn.disabled = false;
        submitBtn.textContent = "Send message";
      });
  });
})();
