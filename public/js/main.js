// Interações do site da Landora Motors.
// A integração com o Firebase (login, estoque, pedidos) entra em uma próxima etapa.

(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------- Menu mobile ---------- */
  var toggle = $('.menu-toggle');
  var menu = $('#menu');
  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      var open = menu.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    });
    menu.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        menu.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Abrir menu');
      }
    });
  }

  /* ---------- Rolagem: progresso e cabeçalho em forma de ilha ---------- */
  var header = $('.site-header');
  var ticking = false;
  function onScroll() {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    document.documentElement.style.setProperty('--p', max > 0 ? (window.scrollY / max).toFixed(4) : 0);
    header.classList.toggle('scrolled', window.scrollY > 40);
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  /* ---------- Pílula deslizante do menu + seção ativa ---------- */
  var pill = $('.nav-pill');
  var links = $$('.main-nav a');
  var activeLink = null;
  function movePill(a) {
    if (!pill || !a) { if (pill) pill.style.opacity = 0; return; }
    pill.style.width = a.offsetWidth + 'px';
    pill.style.transform = 'translateX(' + a.offsetLeft + 'px)';
    pill.style.opacity = 1;
  }
  function setActive(a) {
    activeLink = a;
    links.forEach(function (l) { l.classList.toggle('is-active', l === a); });
    movePill(a);
  }
  links.forEach(function (a) {
    a.addEventListener('mouseenter', function () { movePill(a); });
    a.addEventListener('focus', function () { movePill(a); });
  });
  if (menu) {
    menu.addEventListener('mouseleave', function () { movePill(activeLink); });
    menu.addEventListener('focusout', function () { movePill(activeLink); });
  }
  window.addEventListener('resize', function () { movePill(activeLink); });

  var spy = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      var a = links.filter(function (l) { return l.getAttribute('href') === '#' + en.target.id; })[0];
      if (a) setActive(a);
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  ['como-funciona', 'vantagens', 'carros', 'faq', 'contato'].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) spy.observe(el);
  });
  // Ao voltar ao topo, nenhuma seção fica marcada
  var hero = $('.hero');
  if (hero) {
    new IntersectionObserver(function (en) {
      if (en[0].isIntersecting) setActive(null);
    }, { threshold: 0.5 }).observe(hero);
  }

  /* ---------- Entrada ao rolar ---------- */
  var revealTargets = $$('.section-head, .steps li, .adv, .car-card, .faq-list details, .cta, .toolbar');
  var groups = new Map();
  revealTargets.forEach(function (el) {
    var key = el.parentElement;
    var n = groups.get(key) || 0;
    groups.set(key, n + 1);
    el.setAttribute('data-reveal', '');
    el.style.setProperty('--d', n);
  });
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      var el = en.target;
      io.unobserve(el);
      el.classList.add('in');
      // Remove o estado de entrada ao terminar, para não atrasar o hover depois
      var done = function (e) {
        if (e.propertyName !== 'opacity') return;
        el.removeEventListener('transitionend', done);
        el.removeAttribute('data-reveal');
        el.classList.remove('in');
        el.style.removeProperty('--d');
      };
      el.addEventListener('transitionend', done);
    });
  }, { threshold: 0.15 });
  revealTargets.forEach(function (el) { io.observe(el); });

  // Elementos que animam por classe .in (linha dos passos e velocímetro)
  var inView = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) { en.target.classList.add('in'); inView.unobserve(en.target); }
    });
  }, { threshold: 0.4 });
  var steps = $('.steps');
  var speedo = $('.speedo');
  [steps, speedo].forEach(function (el) { if (el) inView.observe(el); });
  $$('.steps li').forEach(function (li, i) { li.style.setProperty('--d', i); });

  /* ---------- Contadores ---------- */
  function countUp(el) {
    var end = parseInt(el.getAttribute('data-count'), 10);
    if (reduce) { el.textContent = end; return; }
    var start = performance.now();
    var dur = 1400;
    (function tick(now) {
      var t = Math.min((now - start) / dur, 1);
      el.textContent = Math.round(end * (1 - Math.pow(1 - t, 3)));
      if (t < 1) requestAnimationFrame(tick);
    })(start);
  }
  $$('[data-count]').forEach(function (el) {
    el.textContent = 0;
    setTimeout(function () { countUp(el); }, 1100);
  });

  /* ---------- Holofote dos cards e paralaxe do hero ---------- */
  $$('.spot').forEach(function (el) {
    el.addEventListener('pointermove', function (e) {
      var r = el.getBoundingClientRect();
      el.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      el.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });
  var stage = $('.hero-stage');
  if (hero && stage && !reduce && window.matchMedia('(hover: hover)').matches) {
    hero.addEventListener('pointermove', function (e) {
      var r = hero.getBoundingClientRect();
      stage.style.setProperty('--px', ((e.clientX - r.left) / r.width - 0.5).toFixed(3));
      stage.style.setProperty('--py', ((e.clientY - r.top) / r.height - 0.5).toFixed(3));
    });
    hero.addEventListener('pointerleave', function () {
      stage.style.setProperty('--px', 0);
      stage.style.setProperty('--py', 0);
    });
  }

  /* ---------- Estoque: filtros, busca e contagem ---------- */
  var cards = $$('.car-card');
  var pills = $$('.pill');
  var input = $('#busca');
  var count = $('#contagem');
  var empty = $('#vazio');
  var filter = 'todos';

  cards.forEach(function (c, i) { c.style.viewTransitionName = 'car-' + i; });

  function norm(t) { return t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }

  function applyFilter() {
    var q = norm(input.value.trim());
    var shown = 0;
    cards.forEach(function (c) {
      var ok = (filter === 'todos' || c.dataset.cat === filter) && norm(c.dataset.name).indexOf(q) !== -1;
      var wasHidden = c.hidden;
      c.hidden = !ok;
      if (ok) {
        shown++;
        if (wasHidden && !reduce) {
          c.classList.add('pop');
          c.addEventListener('animationend', function () { c.classList.remove('pop'); }, { once: true });
        }
      }
    });
    count.textContent = shown;
    empty.hidden = shown !== 0;
  }
  function update() {
    if (document.startViewTransition && !reduce) document.startViewTransition(applyFilter);
    else applyFilter();
  }

  pills.forEach(function (p) {
    p.addEventListener('click', function () {
      filter = p.dataset.filter;
      pills.forEach(function (o) {
        var on = o === p;
        o.classList.toggle('is-on', on);
        o.setAttribute('aria-pressed', String(on));
      });
      update();
    });
  });
  input.addEventListener('input', update);
  var reset = $('[data-reset]');
  if (reset) reset.addEventListener('click', function () {
    input.value = '';
    filter = 'todos';
    pills.forEach(function (o) {
      var on = o.dataset.filter === 'todos';
      o.classList.toggle('is-on', on);
      o.setAttribute('aria-pressed', String(on));
    });
    update();
  });

  /* ---------- FAQ com abertura animada ---------- */
  var items = $$('.faq-list details');
  function animate(d, open) {
    var body = $('p', d);
    if (reduce) { d.open = open; return; }
    if (d._anim) d._anim.cancel();
    if (open) {
      d.open = true;
      var h = body.scrollHeight;
      d._anim = body.animate(
        [{ height: '0px', opacity: 0, paddingBottom: '0px' }, { height: h + 'px', opacity: 1, paddingBottom: '20px' }],
        { duration: 380, easing: 'cubic-bezier(.2,.7,.2,1)' }
      );
      d._anim.onfinish = function () { d._anim = null; };
    } else {
      var from = body.offsetHeight;
      d._anim = body.animate(
        [{ height: from + 'px', opacity: 1, paddingBottom: '20px' }, { height: '0px', opacity: 0, paddingBottom: '0px' }],
        { duration: 280, easing: 'cubic-bezier(.4,0,.2,1)' }
      );
      d._anim.onfinish = function () { d.open = false; d._anim = null; };
    }
  }
  items.forEach(function (d) {
    $('summary', d).addEventListener('click', function (e) {
      e.preventDefault();
      var isOpen = d._state === undefined ? d.open : d._state;
      items.forEach(function (o) {
        var oOpen = o._state === undefined ? o.open : o._state;
        if (o !== d && oOpen) { o._state = false; animate(o, false); }
      });
      d._state = !isOpen;
      animate(d, d._state);
    });
  });

  /* ---------- Diálogo "Receba uma proposta" ---------- */
  var dlg = $('#lead');
  var form = $('#lead-form');
  var ok = $('#lead-ok');
  var erro = $('#lead-erro');
  var select = $('#lead-carro');

  // Lista de carros do estoque + opção livre
  var opts = ['Ainda não sei'].concat(cards.map(function (c) { return $('h3', c).textContent; }));
  select.innerHTML = opts.map(function (o) { return '<option>' + o + '</option>'; }).join('');

  function openLead(car) {
    form.hidden = false;
    ok.hidden = true;
    erro.hidden = true;
    if (car) select.value = car;
    if (!dlg.open) dlg.showModal();
    var first = $('input', form);
    if (first) first.focus();
  }
  function closeLead() {
    if (!dlg.open) return;
    if (reduce) { dlg.close(); return; }
    dlg.classList.add('closing');
    dlg.addEventListener('animationend', function () {
      dlg.classList.remove('closing');
      dlg.close();
    }, { once: true });
  }
  $$('[data-open-lead]').forEach(function (b) {
    b.addEventListener('click', function () { openLead(b.getAttribute('data-car')); });
  });
  $$('[data-close-lead]').forEach(function (b) { b.addEventListener('click', closeLead); });
  dlg.addEventListener('click', function (e) { if (e.target === dlg) closeLead(); });
  dlg.addEventListener('cancel', function (e) { e.preventDefault(); closeLead(); });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var nome = form.elements.nome.value.trim();
    var zap = form.elements.whatsapp.value.replace(/\D/g, '');
    if (!nome || zap.length < 10) { erro.hidden = false; return; }
    // Versão visual: os dados NÃO são enviados nem salvos em lugar nenhum.
    // Na etapa do Firebase, gravar o pedido no Firestore (coleção "leads") aqui.
    erro.hidden = true;
    form.hidden = true;
    ok.hidden = false;
    form.reset();
  });
})();
