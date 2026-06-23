/* Shared behavior for all pages */
(function () {
  "use strict";
  var root = document.documentElement;

  /* ----- Theme (persisted + system default) ----- */
  try {
    var stored = localStorage.getItem("pref-theme");
    if (stored) {
      root.setAttribute("data-theme", stored);
    } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      root.setAttribute("data-theme", "dark");
    }
  } catch (e) {}

  var themeToggle = document.getElementById("themeToggle");
  if (themeToggle) {
    var sync = function () {
      themeToggle.setAttribute("aria-pressed", root.getAttribute("data-theme") === "dark");
    };
    sync();
    themeToggle.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("pref-theme", next); } catch (e) {}
      sync();
    });
  }

  /* ----- Mobile nav ----- */
  var navToggle = document.getElementById("navToggle");
  var primaryNav = document.getElementById("primaryNav");
  if (navToggle && primaryNav) {
    navToggle.addEventListener("click", function () {
      var open = navToggle.getAttribute("aria-expanded") === "true";
      navToggle.setAttribute("aria-expanded", String(!open));
      primaryNav.classList.toggle("open", !open);
    });
    primaryNav.addEventListener("click", function (e) {
      if (e.target.closest("a")) {
        navToggle.setAttribute("aria-expanded", "false");
        primaryNav.classList.remove("open");
      }
    });
  }

  /* ----- Header border on scroll ----- */
  var header = document.getElementById("siteHeader");
  if (header) {
    var onScroll = function () { header.classList.toggle("scrolled", window.scrollY > 8); };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ----- Scroll reveal ----- */
  var reveals = document.querySelectorAll(".reveal");
  if (reduce || !("IntersectionObserver" in window)) {
    reveals.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add("in"); io.unobserve(entry.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  }

  /* ----- Active-section highlight in nav (scroll-spy) ----- */
  var navLinks = primaryNav ? primaryNav.querySelectorAll('a[href^="#"]') : [];
  if (navLinks.length && "IntersectionObserver" in window) {
    var byId = {};
    navLinks.forEach(function (a) {
      var id = a.getAttribute("href").slice(1);
      var sec = document.getElementById(id);
      if (sec) byId[id] = a;
    });
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          navLinks.forEach(function (a) { a.classList.remove("active"); a.removeAttribute("aria-current"); });
          var a = byId[entry.target.id];
          if (a) { a.classList.add("active"); a.setAttribute("aria-current", "true"); }
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });
    Object.keys(byId).forEach(function (id) { spy.observe(document.getElementById(id)); });
  }

  /* ----- Copy email ----- */
  var copyBtn = document.getElementById("copyEmail");
  if (copyBtn) {
    var label = copyBtn.querySelector(".copy-label");
    var original = label ? label.textContent : "Copy email";
    copyBtn.addEventListener("click", function () {
      var email = copyBtn.getAttribute("data-email");
      var done = function () {
        copyBtn.classList.add("copied");
        if (label) label.textContent = "Copied!";
        setTimeout(function () {
          copyBtn.classList.remove("copied");
          if (label) label.textContent = original;
        }, 1800);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email).then(done).catch(done);
      } else {
        var t = document.createElement("textarea");
        t.value = email; document.body.appendChild(t); t.select();
        try { document.execCommand("copy"); } catch (e) {}
        document.body.removeChild(t); done();
      }
    });
  }

  /* ----- Footer year ----- */
  var yr = document.getElementById("year");
  if (yr) yr.textContent = new Date().getFullYear();

  /* ----- Lightbox (hobbies) ----- */
  var lightbox = document.getElementById("lightbox");
  if (lightbox) {
    var lbImg = lightbox.querySelector("img");
    var lbClose = lightbox.querySelector(".lightbox-close");
    var lastFocus = null;
    var open = function (src, alt, trigger) {
      lastFocus = trigger || document.activeElement;
      lbImg.src = src; lbImg.alt = alt || "";
      lightbox.classList.add("open");
      document.body.style.overflow = "hidden";
      if (lbClose) lbClose.focus();
    };
    var close = function () {
      lightbox.classList.remove("open");
      document.body.style.overflow = "";
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    };
    document.querySelectorAll("[data-lightbox]").forEach(function (el) {
      el.setAttribute("tabindex", "0");
      el.setAttribute("role", "button");
      var trigger = function () { var img = el.querySelector("img"); if (img) open(img.src, img.alt, el); };
      el.addEventListener("click", trigger);
      el.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); trigger(); }
      });
    });
    if (lbClose) lbClose.addEventListener("click", close);
    lightbox.addEventListener("click", function (e) { if (e.target === lightbox) close(); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && lightbox.classList.contains("open")) close();
    });
  }
})();
