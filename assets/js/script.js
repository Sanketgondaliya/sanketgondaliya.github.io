'use strict';

// ===== PARTICLE BACKGROUND =====
const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');
let particles = [];
let mouseX = -1000, mouseY = -1000;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

class Particle {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = Math.random() * 1.5 + 0.5;
    this.baseX = this.x;
    this.baseY = this.y;
    this.vx = (Math.random() - 0.5) * 0.3;
    this.vy = (Math.random() - 0.5) * 0.3;
    this.opacity = Math.random() * 0.4 + 0.1;
    this.pulseSpeed = Math.random() * 0.02 + 0.01;
    this.pulseOffset = Math.random() * Math.PI * 2;
  }

  update(time) {
    // Gentle floating
    this.x += this.vx;
    this.y += this.vy;

    // Mouse repulsion with elastic spring
    const dx = this.x - mouseX;
    const dy = this.y - mouseY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 150) {
      const force = (150 - dist) / 150;
      this.x += (dx / dist) * force * 2;
      this.y += (dy / dist) * force * 2;
    }

    // Wrap
    if (this.x < -10) this.x = canvas.width + 10;
    if (this.x > canvas.width + 10) this.x = -10;
    if (this.y < -10) this.y = canvas.height + 10;
    if (this.y > canvas.height + 10) this.y = -10;

    // Pulse
    this.currentOpacity = this.opacity + Math.sin(time * this.pulseSpeed + this.pulseOffset) * 0.1;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(124, 58, 237, ${this.currentOpacity})`;
    ctx.fill();
  }
}

function initParticles() {
  particles = [];
  const count = Math.min(Math.floor((canvas.width * canvas.height) / 10000), 150);
  for (let i = 0; i < count; i++) particles.push(new Particle());
}

function drawConnections() {
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 120) {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(124, 58, 237, ${0.06 * (1 - dist / 120)})`;
        ctx.lineWidth = 0.5;
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.stroke();
      }
    }
  }
}

let time = 0;
function animateParticles() {
  time++;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(p => { p.update(time); p.draw(); });
  drawConnections();
  requestAnimationFrame(animateParticles);
}

initParticles();
animateParticles();
window.addEventListener('resize', () => { resizeCanvas(); initParticles(); });


// ===== CUSTOM CURSOR =====
const cursor = document.getElementById('cursor');
const cursorFollower = document.getElementById('cursorFollower');
let cX = 0, cY = 0, fX = 0, fY = 0;

document.addEventListener('mousemove', (e) => {
  cX = e.clientX;
  cY = e.clientY;
  mouseX = e.clientX;
  mouseY = e.clientY;

  // Hero spotlight
  const spotlight = document.getElementById('heroSpotlight');
  if (spotlight) {
    spotlight.style.left = e.clientX + 'px';
    spotlight.style.top = e.clientY + 'px';
  }
});

if (cursor && cursorFollower) {
  function animCursor() {
    cursor.style.transform = `translate(${cX - 3}px, ${cY - 3}px)`;
    fX += (cX - fX) * 0.1;
    fY += (cY - fY) * 0.1;
    cursorFollower.style.transform = `translate(${fX - 20}px, ${fY - 20}px)`;
    requestAnimationFrame(animCursor);
  }
  animCursor();

  // Hover effects
  const hoverEls = document.querySelectorAll('a, button, .glow-card, .skill-tag, .filter-btn, .magnetic-wrap');
  hoverEls.forEach(el => {
    el.addEventListener('mouseenter', () => cursorFollower.classList.add('hover'));
    el.addEventListener('mouseleave', () => cursorFollower.classList.remove('hover'));
  });
}


// ===== MAGNETIC BUTTON EFFECT =====
document.querySelectorAll('.magnetic-wrap').forEach(wrap => {
  const area = wrap.querySelector('.magnetic-area');
  if (!area) return;

  wrap.addEventListener('mousemove', (e) => {
    const rect = wrap.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    area.style.transform = `translate(${x * 0.25}px, ${y * 0.25}px)`;
  });

  wrap.addEventListener('mouseleave', () => {
    area.style.transform = 'translate(0, 0)';
  });
});


// ===== SCROLL PROGRESS =====
const scrollProgress = document.getElementById('scrollProgress');
function updateScrollProgress() {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  if (scrollProgress && docHeight > 0) {
    scrollProgress.style.width = (scrollTop / docHeight) * 100 + '%';
  }
}
window.addEventListener('scroll', updateScrollProgress);


// ===== NAVBAR =====
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 60);
});

// Mobile toggle
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
if (navToggle) {
  navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    navLinks.classList.toggle('active');
  });
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      navToggle.classList.remove('active');
      navLinks.classList.remove('active');
    });
  });
}


// ===== ACTIVE NAV ON SCROLL =====
const sections = document.querySelectorAll('section[id]');
const navLinksAll = document.querySelectorAll('.nav-link');

function updateActiveNav() {
  const scrollY = window.scrollY + 200;
  sections.forEach(section => {
    const top = section.offsetTop;
    const height = section.offsetHeight;
    const id = section.getAttribute('id');
    if (scrollY >= top && scrollY < top + height) {
      navLinksAll.forEach(link => {
        link.classList.toggle('active', link.getAttribute('data-section') === id);
      });
    }
  });
}
window.addEventListener('scroll', updateActiveNav);


// ===== TYPING EFFECT =====
const typingText = document.getElementById('typingText');
const roles = [
  'Full-Stack Software Engineer',
  'Backend Developer',
  'Web GIS Specialist',
  'AI/ML Engineer',
  'Geospatial Data Architect'
];

let roleIdx = 0, charIdx = 0, isDeleting = false, speed = 80;

function typeRole() {
  if (!typingText) return;
  const role = roles[roleIdx];

  if (isDeleting) {
    typingText.textContent = role.substring(0, charIdx - 1);
    charIdx--;
    speed = 35;
  } else {
    typingText.textContent = role.substring(0, charIdx + 1);
    charIdx++;
    speed = 70;
  }

  if (!isDeleting && charIdx === role.length) {
    isDeleting = true;
    speed = 2500;
  } else if (isDeleting && charIdx === 0) {
    isDeleting = false;
    roleIdx = (roleIdx + 1) % roles.length;
    speed = 500;
  }

  setTimeout(typeRole, speed);
}
setTimeout(typeRole, 800);


// ===== SCROLL ANIMATIONS =====
const observerOptions = { root: null, rootMargin: '0px 0px -60px 0px', threshold: 0.1 };

const scrollObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const delay = parseInt(entry.target.getAttribute('data-delay') || '0');
      setTimeout(() => entry.target.classList.add('visible'), delay);
    }
  });
}, observerOptions);

document.querySelectorAll('.animate-on-scroll').forEach(el => scrollObserver.observe(el));


// ===== COUNTER ANIMATION =====
function animateCounter(el, target) {
  let current = 0;
  const duration = 1500;
  const start = performance.now();

  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    // Ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    current = Math.floor(eased * target);
    el.textContent = current;
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.stat-number').forEach(num => {
        animateCounter(num, parseInt(num.getAttribute('data-target')));
      });
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

const heroStats = document.querySelector('.hero-stats');
if (heroStats) counterObserver.observe(heroStats);


// ===== PROJECT FILTERS =====
const filterBtns = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('.project-card');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.getAttribute('data-filter');

    projectCards.forEach((card, i) => {
      const cat = card.getAttribute('data-category');
      const show = filter === 'all' || cat === filter;
      card.classList.toggle('hidden', !show);
      if (show) {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        setTimeout(() => {
          card.style.transition = 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
          card.style.opacity = '1';
          card.style.transform = 'translateY(0)';
        }, i * 80);
      }
    });
  });
});


// ===== GLOW CARD MOUSE TRACKING =====
document.querySelectorAll('.glow-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Move the glow border gradient origin
    const border = card.querySelector('.glow-card-border');
    if (border) {
      border.style.background = `radial-gradient(600px circle at ${x}px ${y}px, rgba(124,58,237,0.3), rgba(37,99,235,0.1), transparent 70%)`;
    }

    // 3D tilt effect
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -3;
    const rotateY = ((x - centerX) / centerX) * 3;
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
    const border = card.querySelector('.glow-card-border');
    if (border) {
      border.style.background = '';
    }
  });
});


// ===== PARALLAX ON ORBIT BADGES =====
document.addEventListener('mousemove', (e) => {
  const badges = document.querySelectorAll('[data-parallax]');
  badges.forEach(badge => {
    const speed = parseFloat(badge.getAttribute('data-parallax'));
    const x = (window.innerWidth / 2 - e.clientX) * speed;
    const y = (window.innerHeight / 2 - e.clientY) * speed;
    badge.style.transform = `translate(${x}px, ${y}px)`;
  });
});


// ===== TIMELINE SCROLL FILL =====
function updateTimelineFill() {
  const timeline = document.querySelector('.timeline');
  if (!timeline) return;

  const line = document.querySelector('.timeline-line');
  if (!line) return;

  const rect = timeline.getBoundingClientRect();
  const scrollProgress = Math.max(0, Math.min(1,
    (window.innerHeight - rect.top) / (rect.height + window.innerHeight)
  ));

  const afterEl = line.querySelector('::after') || line;
  line.style.setProperty('--fill', (scrollProgress * 100) + '%');
}

// Use CSS custom property for timeline fill
const timelineStyle = document.createElement('style');
timelineStyle.textContent = `
  .timeline-line::after {
    height: var(--fill, 0%) !important;
  }
`;
document.head.appendChild(timelineStyle);
window.addEventListener('scroll', updateTimelineFill);


// Hero name simple reveal (no letter splitting to avoid clipping)
const heroName = document.getElementById('heroName');
if (heroName) {
  heroName.style.opacity = '0';
  heroName.style.transform = 'translateY(20px)';
  setTimeout(() => {
    heroName.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
    heroName.style.opacity = '1';
    heroName.style.transform = 'translateY(0)';
  }, 600);
}


// ===== SMOOTH SCROLL =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});


// ===== CONTACT FORM =====
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = contactForm.querySelector('button[type="submit"]');
    const text = btn.querySelector('.btn-text');
    const original = text.textContent;
    
    // UI Loading state
    text.textContent = 'Sending...';
    btn.style.opacity = '0.7';
    btn.style.pointerEvents = 'none';

    try {
      const formData = new FormData(contactForm);
      const response = await fetch('https://formsubmit.co/ajax/sanketgondaliya6@gmail.com', {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        text.textContent = 'Sent! ✓';
        btn.style.background = 'linear-gradient(135deg, #22c55e, #16a34a)';
        btn.style.opacity = '1';
        setTimeout(() => {
          text.textContent = original;
          btn.style.background = '';
          btn.style.pointerEvents = 'all';
          contactForm.reset();
        }, 3000);
      } else {
        throw new Error('Form submission failed');
      }
    } catch (error) {
      text.textContent = 'Error! Try Again';
      btn.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
      btn.style.opacity = '1';
      setTimeout(() => {
        text.textContent = original;
        btn.style.background = '';
        btn.style.pointerEvents = 'all';
      }, 3000);
    }
  });
}
