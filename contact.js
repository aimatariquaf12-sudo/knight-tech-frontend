/* ==========================================================
   contact.js
   Small enhancements for the Contact page:
   1) Scroll-reveal for elements with the .reveal class
   2) Subtle mouse-parallax on the background glow orbs
   3) Contact form submission to backend
   Respects prefers-reduced-motion.
   ========================================================== */

(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  // Backend URL — jab website live hogi, isay apne actual backend domain se replace kar dein
  var API_BASE_URL = "https://knight-tech-backend-production.up.railway.app/api/contacts";

  /* ---------- 1) Scroll reveal ---------- */
  function initScrollReveal() {
    var revealEls = document.querySelectorAll(".reveal");
    if (!revealEls.length) return;

    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      revealEls.forEach(function (el) {
        el.classList.add("in-view");
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );

    revealEls.forEach(function (el) {
      observer.observe(el);
    });
  }

  /* ---------- 2) Mouse parallax on background glows ---------- */
  function initGlowParallax() {
    if (prefersReducedMotion) return;

    var sections = document.querySelectorAll("#page-banner, .contact");

    sections.forEach(function (section) {
      var glows = section.querySelectorAll(".contact-bg-anim .glow");
      if (!glows.length) return;

      section.addEventListener("mousemove", function (e) {
        var rect = section.getBoundingClientRect();
        var relX = (e.clientX - rect.left) / rect.width - 0.5; // -0.5..0.5
        var relY = (e.clientY - rect.top) / rect.height - 0.5;

        glows.forEach(function (glow, i) {
          var strength = 18 + i * 6; // vary movement per orb
          var x = relX * strength;
          var y = relY * strength;
          glow.style.transform = "translate(" + x + "px, " + y + "px)";
        });
      });

      section.addEventListener("mouseleave", function () {
        glows.forEach(function (glow) {
          glow.style.transform = "translate(0, 0)";
        });
      });
    });
  }

  /* ---------- 3) Contact form — ab backend ko data bhejta hai ---------- */
  function initContactForm() {
    var form = document.querySelector(".contact-form");
    if (!form) return;

    // Status message dikhane ke liye ek chota paragraph form ke aakhir mein add karte hain
    var statusEl = document.createElement("p");
    statusEl.className = "form-status";
    statusEl.style.marginTop = "12px";
    statusEl.style.fontSize = "14px";
    form.appendChild(statusEl);

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var btn = form.querySelector(".btn");
      var originalBtnText = btn ? btn.textContent : "";

      var firstName = document.getElementById("fname").value.trim();
      var lastName = document.getElementById("lname").value.trim();
      var email = document.getElementById("email").value.trim();
      var service = document.getElementById("service").value;
      var message = document.getElementById("msg").value.trim();

      // Basic validation
      if (!firstName || !email) {
        statusEl.textContent = "Please fill in your first name and email.";
        statusEl.style.color = "#e33";
        return;
      }

      if (btn) {
        btn.disabled = true;
        btn.textContent = "Sending...";
      }
      statusEl.textContent = "";

      fetch(API_BASE_URL , {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: firstName,
          lastName: lastName,
          email: email,
          service: service,
          message: message,
        }),
      })
        .then(function (response) {
          return response.json().then(function (data) {
            if (!response.ok) {
              throw new Error(data.error || "Something went wrong.");
            }
            return data;
          });
        })
        .then(function () {
          statusEl.textContent =
            "Thanks — we've received your message and will be in touch within two working days.";
          statusEl.style.color = "#2F63FF";
          if (btn) {
            btn.textContent = "Request Sent \u2713";
          }
          form.reset();
        })
        .catch(function (err) {
          statusEl.textContent =
            err.message || "Could not send your message. Please try again.";
          statusEl.style.color = "#e33";
          if (btn) {
            btn.disabled = false;
            btn.textContent = originalBtnText;
          }
        });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initScrollReveal();
    initGlowParallax();
    initContactForm();
  });
})();