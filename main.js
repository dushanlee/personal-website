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
          navLinks.forEach(function (a) { a.classList.remove("active"); });
          var a = byId[entry.target.id];
          if (a) a.classList.add("active");
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });
    Object.keys(byId).forEach(function (id) { spy.observe(document.getElementById(id)); });
  }

  /* ----- Footer year ----- */
  var yr = document.getElementById("year");
  if (yr) yr.textContent = new Date().getFullYear();

  /* ----- Lightbox (hobbies) ----- */
  var lightbox = document.getElementById("lightbox");
  if (lightbox) {
    var lbImg = lightbox.querySelector("img");
    var lbClose = lightbox.querySelector(".lightbox-close");
    var open = function (src, alt) {
      lbImg.src = src; lbImg.alt = alt || "";
      lightbox.classList.add("open");
      document.body.style.overflow = "hidden";
    };
    var close = function () { lightbox.classList.remove("open"); document.body.style.overflow = ""; };
    document.querySelectorAll("[data-lightbox]").forEach(function (el) {
      el.addEventListener("click", function () {
        var img = el.querySelector("img");
        if (img) open(img.src, img.alt);
      });
    });
    if (lbClose) lbClose.addEventListener("click", close);
    lightbox.addEventListener("click", function (e) { if (e.target === lightbox) close(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });
  }
})();
