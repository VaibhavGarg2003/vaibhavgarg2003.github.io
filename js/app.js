document.addEventListener("DOMContentLoaded", () => {

  // Honors the OS "reduce motion" accessibility setting
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ============================================================
  // 1. PARTICLE SYSTEM — lightweight dots + connections on canvas
  // ============================================================
  const canvas = document.getElementById("particles-canvas");
  const ctx = canvas.getContext("2d");
  let particles = [];
  let animationId;
  const PARTICLE_COUNT = 60;
  const CONNECTION_DIST = 120;

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  class Particle {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.vx = (Math.random() - 0.5) * 0.4;
      this.vy = (Math.random() - 0.5) * 0.4;
      this.radius = Math.random() * 1.5 + 0.5;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
      if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(99, 102, 241, 0.5)";
      ctx.fill();
    }
  }

  function initParticles() {
    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(new Particle());
    }
  }

  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONNECTION_DIST) {
          const opacity = (1 - dist / CONNECTION_DIST) * 0.15;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(99, 102, 241, ${opacity})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.update();
      p.draw();
    });
    drawConnections();
    animationId = requestAnimationFrame(animateParticles);
  }

  if (!reducedMotion) {
    initParticles();
    animateParticles();

    // Pause the animation when the tab is hidden (saves battery)
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        cancelAnimationFrame(animationId);
      } else {
        animateParticles();
      }
    });
  }

  // ============================================================
  // 2. TYPING ANIMATION
  // EDIT HERE: these are the rotating phrases in the hero section
  // ============================================================
  const typedEl = document.getElementById("typed-text");
  const phrases = [
    "build ML & data-driven applications.",
    "design RAG and LLM pipelines.",
    "turn messy data into decisions.",
    "care about code that ships."
  ];
  let phraseIdx = 0;
  let charIdx = 0;
  let isDeleting = false;
  const TYPE_SPEED = 60;
  const DELETE_SPEED = 35;
  const PAUSE_END = 2000;
  const PAUSE_START = 400;

  function typeLoop() {
    const current = phrases[phraseIdx];
    if (!isDeleting) {
      typedEl.textContent = current.substring(0, charIdx + 1);
      charIdx++;
      if (charIdx === current.length) {
        isDeleting = true;
        setTimeout(typeLoop, PAUSE_END);
        return;
      }
      setTimeout(typeLoop, TYPE_SPEED);
    } else {
      typedEl.textContent = current.substring(0, charIdx - 1);
      charIdx--;
      if (charIdx === 0) {
        isDeleting = false;
        phraseIdx = (phraseIdx + 1) % phrases.length;
        setTimeout(typeLoop, PAUSE_START);
        return;
      }
      setTimeout(typeLoop, DELETE_SPEED);
    }
  }

  if (reducedMotion) {
    typedEl.textContent = phrases[0];
  } else {
    setTimeout(typeLoop, 800);
  }

  // ============================================================
  // 3. SCROLL PROGRESS BAR
  // ============================================================
  const progressBar = document.getElementById("scroll-progress");

  function updateProgressBar() {
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const progress = (scrollTop / scrollHeight) * 100;
    progressBar.style.width = progress + "%";
  }

  // ============================================================
  // 4. NAVBAR — scroll shrink + active link highlight
  // ============================================================
  const navbar = document.getElementById("navbar");
  const navLinks = document.querySelectorAll(".nav-link");
  const sections = document.querySelectorAll("section[id]");

  function updateNavbar() {
    if (window.scrollY > 50) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }

    // Active link
    let current = "";
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 120;
      if (window.scrollY >= sectionTop) {
        current = section.getAttribute("id");
      }
    });
    navLinks.forEach(link => {
      link.classList.remove("active");
      if (link.getAttribute("href") === "#" + current) {
        link.classList.add("active");
      }
    });
  }

  // Throttled with requestAnimationFrame so scrolling stays smooth
  let scrollTicking = false;
  window.addEventListener("scroll", () => {
    if (!scrollTicking) {
      scrollTicking = true;
      requestAnimationFrame(() => {
        updateProgressBar();
        updateNavbar();
        scrollTicking = false;
      });
    }
  });

  // ============================================================
  // 5. HAMBURGER MENU (Mobile)
  // ============================================================
  const hamburger = document.getElementById("hamburger");
  const navLinksContainer = document.getElementById("nav-links");

  // Create overlay
  const overlay = document.createElement("div");
  overlay.classList.add("mobile-overlay");
  document.body.appendChild(overlay);

  function toggleMenu() {
    hamburger.classList.toggle("open");
    navLinksContainer.classList.toggle("open");
    overlay.classList.toggle("active");
    document.body.style.overflow = navLinksContainer.classList.contains("open") ? "hidden" : "";
  }

  hamburger.addEventListener("click", toggleMenu);
  overlay.addEventListener("click", toggleMenu);

  // Close mobile menu on link click
  navLinksContainer.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      if (navLinksContainer.classList.contains("open")) {
        toggleMenu();
      }
    });
  });

  // ============================================================
  // 6. SMOOTH SCROLL for anchor links
  // ============================================================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const href = this.getAttribute("href");
      if (href === "#") {
        // Bare "#" (the logo) — scroll back to the top
        window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
        return;
      }
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth" });
      }
    });
  });

  // ============================================================
  // 7. INTERSECTION OBSERVER — reveal on scroll (fire once)
  // ============================================================
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -60px 0px"
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("active");
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll(".reveal").forEach(el => observer.observe(el));

  // ============================================================
  // 8. TILT + SPOTLIGHT on project cards (desktop only)
  // ============================================================
  if (window.matchMedia("(hover: hover)").matches && !reducedMotion) {
    document.querySelectorAll(".project-card").forEach(card => {
      card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Spotlight position (used by .project-card::after in style.css)
        card.style.setProperty("--mx", `${x}px`);
        card.style.setProperty("--my", `${y}px`);

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -4;
        const rotateY = ((x - centerX) / centerX) * 4;
        card.style.transform = `translateY(-8px) perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      });

      card.addEventListener("mouseleave", () => {
        card.style.transform = "translateY(0)";
      });
    });
  }

  // ============================================================
  // 9. Console Easter Egg
  // ============================================================
  console.log(
    "%c👋 Hi there! Exploring my code? Let's connect!\nmail.vaibhavgarg2003@gmail.com",
    "color: #818cf8; font-size: 14px; font-weight: bold; background: #030712; padding: 12px 16px; border-radius: 8px; border: 1px solid rgba(99,102,241,0.3);"
  );
});
