const html = document.documentElement;
const body = document.body;

const header = document.querySelector("#header");
const themeToggle = document.querySelector("#theme-toggle");
const menuToggle = document.querySelector("#menu-toggle");
const headerNav = document.querySelector("#header-nav");
const headerLinks = document.querySelectorAll(".header-link");

/* ==========================================================
   TEMA
========================================================== */

function getPreferredTheme() {
  const savedTheme = localStorage.getItem("portfolio-theme");

  if (savedTheme === "light" || savedTheme === "dark") {
    return savedTheme;
  }

  const prefersLight = window.matchMedia(
    "(prefers-color-scheme: light)",
  ).matches;

  return prefersLight ? "light" : "dark";
}

function updateThemeButton(theme) {
  const isLightTheme = theme === "light";

  themeToggle.setAttribute("aria-pressed", String(isLightTheme));

  themeToggle.setAttribute(
    "aria-label",
    isLightTheme ? "Alterar para tema escuro" : "Alterar para tema claro",
  );
}

function applyTheme(theme) {
  html.setAttribute("data-theme", theme);

  localStorage.setItem("portfolio-theme", theme);

  updateThemeButton(theme);
}

applyTheme(getPreferredTheme());

themeToggle.addEventListener("click", () => {
  const currentTheme = html.getAttribute("data-theme");

  const newTheme = currentTheme === "dark" ? "light" : "dark";

  applyTheme(newTheme);
});

/* ==========================================================
   HEADER AO ROLAR
========================================================== */

function updateHeaderOnScroll() {
  header.classList.toggle("scrolled", window.scrollY > 30);
}

updateHeaderOnScroll();

window.addEventListener("scroll", updateHeaderOnScroll, {
  passive: true,
});

/* ==========================================================
   MENU MOBILE
========================================================== */

function openMenu() {
  menuToggle.classList.add("active");
  headerNav.classList.add("active");
  body.classList.add("menu-open");

  menuToggle.setAttribute("aria-expanded", "true");
  menuToggle.setAttribute("aria-label", "Fechar menu");
}

function closeMenu() {
  menuToggle.classList.remove("active");
  headerNav.classList.remove("active");
  body.classList.remove("menu-open");

  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Abrir menu");
}

menuToggle.addEventListener("click", () => {
  const menuIsOpen = headerNav.classList.contains("active");

  if (menuIsOpen) {
    closeMenu();
  } else {
    openMenu();
  }
});

headerLinks.forEach((link) => {
  link.addEventListener("click", () => {
    closeMenu();
  });
});

document.addEventListener("click", (event) => {
  const clickedInsideNav = headerNav.contains(event.target);
  const clickedMenuButton = menuToggle.contains(event.target);
  const menuIsOpen = headerNav.classList.contains("active");

  if (menuIsOpen && !clickedInsideNav && !clickedMenuButton) {
    closeMenu();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeMenu();
  }
});

/* ==========================================================
   LINK ATIVO CONFORME A SEÇÃO
========================================================== */

const sections = document.querySelectorAll("main section[id]");

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      const currentSectionId = entry.target.id;

      headerLinks.forEach((link) => {
        const linkSectionId = link.getAttribute("href").replace("#", "");

        link.classList.toggle("active", linkSectionId === currentSectionId);
      });
    });
  },
  {
    rootMargin: "-35% 0px -55% 0px",
    threshold: 0,
  },
);

sections.forEach((section) => {
  sectionObserver.observe(section);
});

/* ==========================================================
   AJUSTES DE RESPONSIVIDADE
========================================================== */

window.addEventListener("resize", () => {
  if (window.innerWidth > 850) {
    closeMenu();
  }
});

/* ==========================================================
   MOVIMENTO DA IMAGEM DO HERO
========================================================== */

const heroImageWrapper = document.querySelector("#hero-image-wrapper");

const userPrefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;

function moveHeroImage(event) {
  if (
    !heroImageWrapper ||
    userPrefersReducedMotion ||
    window.innerWidth <= 900
  ) {
    return;
  }

  const heroVisual = heroImageWrapper.parentElement;
  const rect = heroVisual.getBoundingClientRect();

  const mouseX = event.clientX - rect.left;
  const mouseY = event.clientY - rect.top;

  const centerX = rect.width / 2;
  const centerY = rect.height / 2;

  const rotateY = ((mouseX - centerX) / centerX) * 4;
  const rotateX = ((centerY - mouseY) / centerY) * 4;

  heroImageWrapper.style.transform = `
    perspective(1000px)
    rotateX(${rotateX}deg)
    rotateY(${rotateY}deg)
  `;
}

function resetHeroImage() {
  if (!heroImageWrapper) {
    return;
  }

  heroImageWrapper.style.transform = `
    perspective(1000px)
    rotateX(0deg)
    rotateY(0deg)
  `;
}

if (heroImageWrapper) {
  const heroVisual = heroImageWrapper.parentElement;

  heroVisual.addEventListener("mousemove", moveHeroImage);
  heroVisual.addEventListener("mouseleave", resetHeroImage);
}

/* ==========================================================
   CONTADOR DAS MÉTRICAS
========================================================== */

const metricCounters = document.querySelectorAll(".metric-counter");

function animateMetricCounter(counter) {
  const target = Number(counter.dataset.target);
  const suffix = counter.dataset.suffix || "";

  const duration = 1400;
  const startTime = performance.now();

  function updateCounter(currentTime) {
    const elapsedTime = currentTime - startTime;
    const progress = Math.min(elapsedTime / duration, 1);

    const easedProgress = 1 - Math.pow(1 - progress, 3);
    const currentValue = Math.floor(target * easedProgress);

    counter.textContent = `${currentValue}${suffix}`;

    if (progress < 1) {
      requestAnimationFrame(updateCounter);
    } else {
      counter.textContent = `${target}${suffix}`;
    }
  }

  requestAnimationFrame(updateCounter);
}

const metricsObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      animateMetricCounter(entry.target);
      observer.unobserve(entry.target);
    });
  },
  {
    threshold: 0.6,
  },
);

metricCounters.forEach((counter) => {
  metricsObserver.observe(counter);
});
