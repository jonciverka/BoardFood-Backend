/* ==========================================================================
   BoardFood Landing — main.js
   Interacciones: menú móvil, scroll suave, demo generador, FAQ, reveal, año.
   Sin dependencias externas. Sin GSAP (IntersectionObserver nativo).
   ========================================================================== */
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    initMobileMenu();
    initSmoothScroll();
    initGeneradorDemo();
    initFAQAccordion();
    initRevealOnScroll();
    setYear();
  });

  /* ---------- Menú hamburguesa (móvil) ---------- */
  function initMobileMenu() {
    var toggle = document.querySelector('.nav__toggle');
    var menu = document.getElementById('mobile-menu');
    if (!toggle || !menu) return;

    toggle.addEventListener('click', function () {
      var isOpen = menu.classList.toggle('is-open');
      toggle.classList.toggle('is-open', isOpen);
      toggle.setAttribute('aria-expanded', String(isOpen));
      toggle.setAttribute('aria-label', isOpen ? 'Cerrar menú' : 'Abrir menú');
    });

    // Cierra el menú al navegar a una ancla
    menu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        menu.classList.remove('is-open');
        toggle.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- Scroll suave a anclas ---------- */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        var targetId = link.getAttribute('href');
        if (targetId.length <= 1) return; // "#" solo
        var target = document.querySelector(targetId);
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        history.replaceState(null, '', targetId);
      });
    });
  }

  /* ---------- Demo generador de semana (sin backend) ---------- */
  var SAMPLE_CATALOG = [
    { nombre: 'Pasta al pesto', categoria: 'Comida', tag: 'Vegetariano' },
    { nombre: 'Pollo al horno con papas', categoria: 'Comida', tag: 'Proteína' },
    { nombre: 'Ensalada de quinoa', categoria: 'Comida', tag: 'Ligero' },
    { nombre: 'Tacos de frijol', categoria: 'Comida', tag: 'Vegetariano' },
    { nombre: 'Salmón con verduras', categoria: 'Comida', tag: 'Proteína' },
    { nombre: 'Sopa de lentejas', categoria: 'Comida', tag: 'Caliente' },
    { nombre: 'Omelette de espinacas', categoria: 'Desayuno', tag: 'Rápido' },
    { nombre: 'Avena con frutas', categoria: 'Desayuno', tag: 'Rápido' },
    { nombre: 'Sándwich de aguacate', categoria: 'Desayuno', tag: 'Ligero' },
    { nombre: 'Smoothie de plátano', categoria: 'Desayuno', tag: 'Rápido' },
    { nombre: 'Pizza casera', categoria: 'Cena', tag: 'Para compartir' },
    { nombre: 'Wok de verduras', categoria: 'Cena', tag: 'Rápido' },
    { nombre: 'Crema de calabaza', categoria: 'Cena', tag: 'Caliente' },
    { nombre: 'Risotto de champiñones', categoria: 'Cena', tag: 'Vegetariano' }
  ];

  var DAYS_ES = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  function initGeneradorDemo() {
    var btn = document.getElementById('demo-generate');
    var select = document.getElementById('demo-days');
    var result = document.getElementById('demo-result');
    if (!btn || !select || !result) return;

    btn.addEventListener('click', function () {
      var days = parseInt(select.value, 10) || 7;
      renderDemoWeek(result, days);
    });
  }

  function renderDemoWeek(container, days) {
    var items = [];
    for (var i = 0; i < days; i++) {
      var meal = SAMPLE_CATALOG[Math.floor(Math.random() * SAMPLE_CATALOG.length)];
      items.push(
        '<div class="demo__meal">' +
          '<span class="demo__meal-day">' + DAYS_ES[i] + '</span>' +
          '<div class="demo__meal-info">' +
            '<div class="demo__meal-name">' + meal.nombre + '</div>' +
            '<div class="demo__meal-cat">' + meal.categoria + '</div>' +
          '</div>' +
          '<span class="demo__meal-tag">' + meal.tag + '</span>' +
        '</div>'
      );
    }
    container.classList.remove('is-empty');
    container.innerHTML = items.join('');
  }

  /* ---------- Acordeón FAQ ---------- */
  function initFAQAccordion() {
    var items = document.querySelectorAll('.faq-item');
    items.forEach(function (item) {
      var question = item.querySelector('.faq-item__q');
      var answer = item.querySelector('.faq-item__a');
      if (!question || !answer) return;

      question.addEventListener('click', function () {
        var isOpen = item.classList.contains('is-open');

        // Cierra los demás
        items.forEach(function (other) {
          if (other !== item) {
            other.classList.remove('is-open');
            var otherAnswer = other.querySelector('.faq-item__a');
            var otherBtn = other.querySelector('.faq-item__q');
            if (otherAnswer) otherAnswer.style.maxHeight = null;
            if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
          }
        });

        item.classList.toggle('is-open', !isOpen);
        question.setAttribute('aria-expanded', String(!isOpen));
        answer.style.maxHeight = isOpen ? null : answer.scrollHeight + 'px';
      });
    });
  }

  /* ---------- Reveal on scroll (IntersectionObserver nativo) ---------- */
  function initRevealOnScroll() {
    var elements = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) {
      elements.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    elements.forEach(function (el) { observer.observe(el); });
  }

  /* ---------- Año dinámico en el footer ---------- */
  function setYear() {
    var yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = String(new Date().getFullYear());
  }
})();
