(function () {
  "use strict";

  // --- Mobile menu ---
  var burger = document.getElementById("burger");
  var nav = document.getElementById("nav");

  burger.addEventListener("click", function () {
    burger.classList.toggle("is-open");
    nav.classList.toggle("is-open");
  });

  nav.querySelectorAll(".header__link").forEach(function (link) {
    link.addEventListener("click", function () {
      burger.classList.remove("is-open");
      nav.classList.remove("is-open");
    });
  });

  // --- Header scroll ---
  var header = document.getElementById("header");
  window.addEventListener("scroll", function () {
    header.style.boxShadow = window.scrollY > 50
      ? "0 2px 16px rgba(0,0,0,0.12)"
      : "0 2px 12px rgba(0,0,0,0.08)";
  });

  // --- Date picker: block Sunday & Monday ---
  var dateInput = document.getElementById("booking-date");
  if (dateInput) {
    var tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    dateInput.min = tomorrow.toISOString().split("T")[0];

    dateInput.addEventListener("input", function () {
      var day = new Date(this.value + "T00:00:00").getDay();
      if (day === 0 || day === 1) {
        this.setCustomValidity("Siamo chiusi la domenica e il lunedi. Scegli un giorno da martedi a sabato.");
        this.reportValidity();
      } else {
        this.setCustomValidity("");
      }
    });
  }

  // --- Animated counters ---
  function animateCounter(el) {
    var target = parseInt(el.getAttribute("data-target"), 10);
    var suffix = el.getAttribute("data-suffix") || "";
    var duration = 2000;
    var start = 0;
    var startTime = null;

    function easeOutQuart(t) {
      return 1 - Math.pow(1 - t, 4);
    }

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var progress = Math.min((timestamp - startTime) / duration, 1);
      var current = Math.floor(easeOutQuart(progress) * (target - start) + start);
      el.textContent = current.toLocaleString("it-IT") + suffix;
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }

    requestAnimationFrame(step);
  }

  // --- Scroll reveal + counter trigger ---
  var revealElements = document.querySelectorAll(".reveal-up, .reveal-left, .reveal-right");
  var sectionHeaders = document.querySelectorAll(".section__header, .about__text, .about__image, .about__quote, .review-card, .contact__form-wrap, .contact__map");
  var countersAnimated = false;

  // Add reveal classes to section elements
  sectionHeaders.forEach(function (el) {
    if (!el.classList.contains("reveal-up") && !el.classList.contains("reveal-left") && !el.classList.contains("reveal-right")) {
      el.classList.add("reveal-up");
    }
  });

  // Re-query after adding classes
  revealElements = document.querySelectorAll(".reveal-up, .reveal-left, .reveal-right");

  var revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  revealElements.forEach(function (el) {
    revealObserver.observe(el);
  });

  // Counter observer
  var countersSection = document.getElementById("counters");
  if (countersSection) {
    var counterObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && !countersAnimated) {
          countersAnimated = true;
          document.querySelectorAll(".counter__number").forEach(function (el) {
            animateCounter(el);
          });
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    counterObserver.observe(countersSection);
  }

  // --- Hero image slider ---
  var slider = document.getElementById("hero-slider");
  if (slider) {
    var slides = slider.querySelectorAll(".hero__slide");
    if (slides.length > 1) {
      var dotsContainer = document.getElementById("hero-dots");
      var currentSlide = 0;

      // Create dots
      slides.forEach(function (_, i) {
        var dot = document.createElement("button");
        dot.className = "hero__dot" + (i === 0 ? " hero__dot--active" : "");
        dot.setAttribute("aria-label", "Immagine " + (i + 1));
        dot.addEventListener("click", function () { goToSlide(i); });
        dotsContainer.appendChild(dot);
      });

      function goToSlide(index) {
        slides[currentSlide].classList.remove("hero__slide--active");
        dotsContainer.children[currentSlide].classList.remove("hero__dot--active");
        currentSlide = index;
        slides[currentSlide].classList.add("hero__slide--active");
        dotsContainer.children[currentSlide].classList.add("hero__dot--active");
      }

      // Auto-advance
      setInterval(function () {
        goToSlide((currentSlide + 1) % slides.length);
      }, 5000);
    }
  }

  // --- Reviews carousel ---
  var carousel = document.getElementById("reviews-carousel");
  if (carousel) {
    var track = carousel.querySelector(".carousel__track");
    var slides = carousel.querySelectorAll(".carousel__slide");
    var prevBtn = carousel.querySelector(".carousel__btn--prev");
    var nextBtn = carousel.querySelector(".carousel__btn--next");
    var dotsWrap = carousel.querySelector(".carousel__dots");
    var current = 0;
    var autoInterval;

    slides.forEach(function (_, i) {
      var dot = document.createElement("button");
      dot.className = "carousel__dot" + (i === 0 ? " carousel__dot--active" : "");
      dot.addEventListener("click", function () { goTo(i); });
      dotsWrap.appendChild(dot);
    });

    function goTo(index) {
      current = ((index % slides.length) + slides.length) % slides.length;
      track.style.transform = "translateX(-" + (current * 100) + "%)";
      dotsWrap.querySelectorAll(".carousel__dot").forEach(function (d, i) {
        d.classList.toggle("carousel__dot--active", i === current);
      });
    }

    prevBtn.addEventListener("click", function () { goTo(current - 1); resetAuto(); });
    nextBtn.addEventListener("click", function () { goTo(current + 1); resetAuto(); });

    function resetAuto() {
      clearInterval(autoInterval);
      autoInterval = setInterval(function () { goTo(current + 1); }, 4000);
    }
    resetAuto();

    // Swipe support
    var startX = 0;
    track.addEventListener("touchstart", function (e) { startX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener("touchend", function (e) {
      var diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) {
        goTo(diff > 0 ? current + 1 : current - 1);
        resetAuto();
      }
    });
  }

  // --- Form helpers ---
  function validateForm(form) {
    var valid = true;
    form.querySelectorAll("[required]").forEach(function (field) {
      if (field.type === "checkbox" && !field.checked) {
        field.closest(".form__checkbox").style.color = "#e74c3c";
        valid = false;
      } else if (!field.value.trim()) {
        field.classList.add("error");
        valid = false;
      } else {
        field.classList.remove("error");
        if (field.type === "checkbox") {
          field.closest(".form__checkbox").style.color = "";
        }
      }
    });

    form.querySelectorAll('input[type="email"][required]').forEach(function (f) {
      if (f.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value)) {
        f.classList.add("error");
        valid = false;
      }
    });

    return valid;
  }

  function showFeedback(el, type, msg) {
    el.hidden = false;
    el.className = "form__feedback form__feedback--" + type;
    el.textContent = msg;
  }

  // --- Booking form ---
  var bookingForm = document.getElementById("booking-form");
  var bookingFeedback = document.getElementById("booking-feedback");
  if (bookingForm) {
    bookingForm.addEventListener("submit", async function (e) {
      e.preventDefault();
      bookingFeedback.hidden = true;
      if (!validateForm(bookingForm)) {
        showFeedback(bookingFeedback, "error", "Compila tutti i campi obbligatori.");
        return;
      }
      var btn = bookingForm.querySelector(".form__submit");
      btn.disabled = true; btn.textContent = "Invio in corso...";
      try {
        var res = await fetch("/api/booking", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(Object.fromEntries(new FormData(bookingForm))),
        });
        if (res.ok) {
          showFeedback(bookingFeedback, "success", "Prenotazione inviata! Ti ricontatteremo per conferma.");
          bookingForm.reset();
        } else { throw new Error(); }
      } catch (_) {
        showFeedback(bookingFeedback, "error", "Errore nell'invio. Riprova o chiama il 051 882601.");
      } finally {
        btn.disabled = false; btn.textContent = "Invia prenotazione";
      }
    });
  }

  // --- Contact form ---
  var contactForm = document.getElementById("contact-form");
  var contactFeedback = document.getElementById("contact-feedback");
  if (contactForm) {
    contactForm.addEventListener("submit", async function (e) {
      e.preventDefault();
      contactFeedback.hidden = true;
      if (!validateForm(contactForm)) {
        showFeedback(contactFeedback, "error", "Compila tutti i campi obbligatori.");
        return;
      }
      var btn = contactForm.querySelector(".form__submit");
      btn.disabled = true; btn.textContent = "Invio in corso...";
      try {
        var res = await fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(Object.fromEntries(new FormData(contactForm))),
        });
        if (res.ok) {
          showFeedback(contactFeedback, "success", "Messaggio inviato! Ti risponderemo al piu' presto.");
          contactForm.reset();
        } else { throw new Error(); }
      } catch (_) {
        showFeedback(contactFeedback, "error", "Errore nell'invio. Riprova o chiama il 051 882601.");
      } finally {
        btn.disabled = false; btn.textContent = "Invia messaggio";
      }
    });
  }

})();
