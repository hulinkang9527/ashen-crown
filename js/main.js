/* ============================================================
   ASHEN CROWN 灰烬王冠 · 交互脚本
   ============================================================ */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 1. 分隔线鎏金菱形 ---------- */
  document.querySelectorAll('[data-divider]').forEach(function (d) {
    d.appendChild(document.createElement('i'));
  });

  /* ---------- 2. 导航吸顶 ---------- */
  var nav = document.getElementById('nav');
  function onScroll() {
    if (window.scrollY > 40) nav.classList.add('is-stuck');
    else nav.classList.remove('is-stuck');
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- 3. 移动端菜单 ---------- */
  var burger = document.getElementById('burger');
  var links = document.getElementById('navLinks');
  burger.addEventListener('click', function () {
    var open = links.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  links.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () {
      links.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
    });
  });

  /* ---------- 4. 滚动揭示 ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e, i) {
        if (e.isIntersecting) {
          var el = e.target;
          setTimeout(function () { el.classList.add('is-in'); }, i * 90);
          io.unobserve(el);
        }
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------- 5. Hero 视差 ---------- */
  var heroImg = document.getElementById('heroImg');
  if (heroImg && !reduce) {
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var y = Math.min(window.scrollY, window.innerHeight);
        heroImg.style.transform = 'translate3d(0,' + (y * 0.22) + 'px,0) scale(1.1)';
        ticking = false;
      });
    }, { passive: true });
  }

  /* ---------- 6. 余烬粒子 ---------- */
  var cv = document.getElementById('embers');
  if (cv && !reduce) {
    var ctx = cv.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W = 0, H = 0, parts = [];

    function resize() {
      var r = cv.parentElement.getBoundingClientRect();
      W = r.width; H = r.height;
      cv.width = W * dpr; cv.height = H * dpr;
      cv.style.width = W + 'px'; cv.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      build();
    }

    function build() {
      var n = Math.round(Math.min(90, Math.max(34, W / 18)));
      parts = [];
      for (var i = 0; i < n; i++) parts.push(mk(true));
    }

    function mk(rand) {
      return {
        x: Math.random() * W,
        y: rand ? Math.random() * H : H + 10,
        r: 0.6 + Math.random() * 1.9,
        vy: -(0.17 + Math.random() * 0.55),
        vx: (Math.random() - 0.5) * 0.32,
        a: 0.15 + Math.random() * 0.55,
        ph: Math.random() * Math.PI * 2
      };
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i];
        p.x += p.vx + Math.sin(p.ph + p.y * 0.012) * 0.22;
        p.y += p.vy;
        if (p.y < -14 || p.x < -20 || p.x > W + 20) parts[i] = mk(false);

        var g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 5.5);
        g.addColorStop(0, 'rgba(255,190,120,' + p.a + ')');
        g.addColorStop(0.42, 'rgba(200,100,42,' + (p.a * 0.55) + ')');
        g.addColorStop(1, 'rgba(200,100,42,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 5.5, 0, Math.PI * 2);
        ctx.fill();
      }
      requestAnimationFrame(draw);
    }

    window.addEventListener('resize', resize);
    resize();
    draw();
  }

  /* ---------- 7. 发售倒计时 ---------- */
  var cd = document.getElementById('countdown');
  if (cd) {
    var target = new Date('2027-02-26T00:00:00+08:00').getTime();
    var out = {
      d: cd.querySelector('[data-cd="d"]'),
      h: cd.querySelector('[data-cd="h"]'),
      m: cd.querySelector('[data-cd="m"]'),
      s: cd.querySelector('[data-cd="s"]')
    };
    var pad = function (n, len) { return String(n).padStart(len, '0'); };
    var tick = function () {
      var diff = target - Date.now();
      if (diff < 0) diff = 0;
      var s = Math.floor(diff / 1000);
      out.d.textContent = pad(Math.floor(s / 86400), 3);
      out.h.textContent = pad(Math.floor((s % 86400) / 3600), 2);
      out.m.textContent = pad(Math.floor((s % 3600) / 60), 2);
      out.s.textContent = pad(s % 60, 2);
    };
    tick();
    setInterval(tick, 1000);
  }

  /* ---------- 8. 提示条 ---------- */
  var toastEl = document.getElementById('toast');
  var toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('is-on'); }, 2600);
  }

  /* ---------- 9. 愿望单 ---------- */
  var wishBtn = document.getElementById('wishBtn');
  var wishNum = document.getElementById('wishCount');
  var wished = false;
  var base = 12847;
  wishBtn.addEventListener('click', function () {
    wished = !wished;
    wishBtn.classList.toggle('is-on', wished);
    wishNum.textContent = (base + (wished ? 1 : 0)).toLocaleString('en-US');
    toast(wished ? '已加入愿望单 — 火种为你留了一盏。' : '已从愿望单移除。');
  });

  /* ---------- 10. 版本预购 ---------- */
  document.querySelectorAll('[data-buy]').forEach(function (b) {
    b.addEventListener('click', function () {
      toast('『' + b.getAttribute('data-buy') + '』已加入预购清单（演示页，不产生真实订单）');
    });
  });

  /* ---------- 11. 展廊灯箱 ---------- */
  var lb = document.getElementById('lightbox');
  var lbImg = document.getElementById('lbImg');
  document.querySelectorAll('[data-lightbox]').forEach(function (fig) {
    fig.addEventListener('click', function () {
      lbImg.src = fig.getAttribute('data-lightbox');
      lb.classList.add('is-open');
      lb.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    });
  });
  function closeLb() {
    lb.classList.remove('is-open');
    lb.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
  lb.addEventListener('click', function (e) {
    if (e.target === lb || e.target.closest('.lightbox__close')) closeLb();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && lb.classList.contains('is-open')) closeLb();
  });
})();
