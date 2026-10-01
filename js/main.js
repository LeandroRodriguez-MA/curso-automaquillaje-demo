(() => {
  document.documentElement.classList.add('js');

  /* ---------- Navegación ---------- */
  const nav = document.getElementById('nav');
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');

  const onScroll = () => nav.classList.toggle('is-stuck', window.scrollY > 30);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  const setMenu = (open) => {
    links.classList.toggle('is-open', open);
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    document.body.style.overflow = open ? 'hidden' : '';
  };
  toggle.addEventListener('click', () => setMenu(!links.classList.contains('is-open')));
  links.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

  /* ---------- Aparición al hacer scroll ---------- */
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('is-in'));
  }

  /* ---------- Carrusel de looks en loop ---------- */
  const rail = document.querySelector('.gallery__rail');
  if (rail && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const track = document.createElement('div');
    track.className = 'gallery__track';
    const figures = [...rail.children];
    figures.forEach((fig) => track.appendChild(fig));
    // Segunda copia idéntica para que el salto de -50% no se note
    figures.forEach((fig) => {
      const clone = fig.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      track.appendChild(clone);
    });
    track.querySelectorAll('img').forEach((img) => { img.loading = 'eager'; });
    rail.appendChild(track);
    rail.classList.add('is-loop');
  }

  /* ---------- Puntos del carrusel de módulos (móvil) ---------- */
  const modRail = document.getElementById('modulesRail');
  const modDots = document.getElementById('modulesDots');
  if (modRail && modDots) {
    const cards = [...modRail.children];
    const dots = cards.map(() => modDots.appendChild(document.createElement('i')));
    let ticking = false;
    const update = () => {
      ticking = false;
      const left = modRail.getBoundingClientRect().left;
      const dist = cards.map((card) => Math.abs(card.getBoundingClientRect().left - left));
      const atEnd = modRail.scrollLeft > 0 && modRail.scrollLeft + modRail.clientWidth >= modRail.scrollWidth - 4;
      const active = atEnd ? cards.length - 1 : dist.indexOf(Math.min(...dist));
      dots.forEach((dot, i) => dot.classList.toggle('is-active', i === active));
    };
    modRail.addEventListener('scroll', () => {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();
  }

  /* ---------- Barra fija de inscripción (móvil) ---------- */
  const sticky = document.getElementById('stickyCta');
  if (sticky && 'IntersectionObserver' in window) {
    const seen = new Map();
    const targets = [document.querySelector('.hero__actions'), document.getElementById('inscripcion')];
    const stickyIo = new IntersectionObserver((entries) => {
      entries.forEach((entry) => seen.set(entry.target, entry.isIntersecting));
      sticky.classList.toggle('is-visible', !targets.some((t) => seen.get(t)));
    });
    targets.forEach((t) => stickyIo.observe(t));
  }

  /* ---------- Formulario de inscripción (solo frontend) ---------- */
  const form = document.getElementById('enrollForm');
  const done = document.getElementById('formDone');

  const messages = {
    nombre: 'Escribe tu nombre y apellido.',
    email: 'Ingresa un correo válido.',
    telefono: 'Ingresa un número de WhatsApp válido.',
  };
  const rules = {
    nombre: (v) => v.trim().length >= 3,
    email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()),
    telefono: (v) => v.replace(/\D/g, '').length >= 8,
  };

  const validate = (input) => {
    const rule = rules[input.name];
    if (!rule) return true;
    const ok = rule(input.value);
    const field = input.closest('.field');
    field.classList.toggle('is-invalid', !ok);
    field.querySelector('.field__error').textContent = ok ? '' : messages[input.name];
    input.setAttribute('aria-invalid', String(!ok));
    return ok;
  };

  form.addEventListener('input', (e) => {
    if (e.target.closest('.field.is-invalid')) validate(e.target);
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const inputs = [...form.querySelectorAll('input')];
    const invalid = inputs.filter((input) => !validate(input));
    if (invalid.length) { invalid[0].focus(); return; }

    // TODO backend: enviar estos datos al servidor cuando esté disponible
    const data = Object.fromEntries(new FormData(form));

    document.getElementById('doneName').textContent = data.nombre.trim().split(/\s+/)[0];
    done.hidden = false;
  });

  document.getElementById('year').textContent = new Date().getFullYear();
})();
