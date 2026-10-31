/* ==========================================================================
   Mr. Popcorn Man — interactions
   ========================================================================== */
(function () {
  'use strict';

  var CONFIG = {
    // Leave empty to hand the request to the visitor's email app (mailto).
    // Point this at a form endpoint (Formspree, a Cloudflare Worker, etc.)
    // to collect submissions server-side instead.
    formEndpoint: '',
    email: 'andre@mrpopcornman.com'
  };

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.documentElement.classList.add('js');

  /* ---------- Analytics hooks (GA4-ready) ---------- */
  function track(name, params) {
    try {
      if (typeof window.gtag === 'function') window.gtag('event', name, params || {});
      else if (Array.isArray(window.dataLayer)) window.dataLayer.push(Object.assign({ event: name }, params || {}));
    } catch (err) { /* analytics must never break the page */ }
  }
  $$('a[href^="tel:"]').forEach(function (link) {
    link.addEventListener('click', function () { track('call_click', { link_text: link.textContent.trim() }); });
  });

  /* ---------- Header ---------- */
  var header = $('.site-header');
  var onScrollHeader = function () {
    if (!header) return;
    header.classList.toggle('is-stuck', window.scrollY > 24);
  };
  onScrollHeader();
  window.addEventListener('scroll', onScrollHeader, { passive: true });

  /* ---------- Mobile nav ---------- */
  var navToggle = $('.nav-toggle');
  var nav = $('#site-nav');
  function closeNav() {
    document.body.classList.remove('nav-open');
    if (navToggle) {
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.setAttribute('aria-label', 'Open menu');
    }
  }
  if (navToggle && nav) {
    navToggle.addEventListener('click', function () {
      var open = document.body.classList.toggle('nav-open');
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
    $$('a', nav).forEach(function (link) { link.addEventListener('click', closeNav); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeNav();
    });
  }

  /* ---------- Reveal on scroll ---------- */
  var revealEls = $$('[data-reveal]');
  if (revealEls.length) {
    if (reduceMotion || !('IntersectionObserver' in window)) {
      revealEls.forEach(function (el) { el.classList.add('is-in'); });
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in');
            io.unobserve(entry.target);
          }
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
      revealEls.forEach(function (el) { io.observe(el); });
    }
  }

  /* ---------- Hero parallax ---------- */
  var hero = $('.hero');
  var heroArt = $('.hero-art');
  var heroCopy = $('.hero-copy');
  if (hero && heroArt && !reduceMotion) {
    var heroTick = false;
    var heroParallax = function () {
      var y = Math.min(window.scrollY, window.innerHeight);
      heroArt.style.transform = 'translate3d(0,' + (y * 0.08).toFixed(1) + 'px,0)';
      if (heroCopy) heroCopy.style.transform = 'translate3d(0,' + (y * 0.035).toFixed(1) + 'px,0)';
      heroTick = false;
    };
    window.addEventListener('scroll', function () {
      if (!heroTick) {
        heroTick = true;
        window.requestAnimationFrame(heroParallax);
      }
    }, { passive: true });
  }

  /* ---------- Pinned popcorn scroll ---------- */
  var popSection = $('[data-pop-scroll]');
  if (popSection) {
    var popSteps = $$('.pop-step', popSection);
    var popKernels = $$('.pop-kernel', popSection);
    var popMeter = $('[data-pop-meter]', popSection);
    var popCount = $('[data-pop-count]', popSection);
    var popVisual = $('[data-pop-visual]', popSection);
    var popTick = false;
    var currentStep = -1;

    var easeOut = function (t) { return 1 - Math.pow(1 - t, 3); };
    var clamp = function (v, min, max) { return Math.max(min, Math.min(max, v)); };

    var popUpdate = function () {
      popTick = false;
      var rect = popSection.getBoundingClientRect();
      var distance = popSection.offsetHeight - window.innerHeight;
      var p = distance > 0 ? clamp(-rect.top / distance, 0, 1) : 0;

      if (popMeter) popMeter.style.width = (p * 100).toFixed(1) + '%';

      var stepIndex = p < 0.34 ? 0 : p < 0.67 ? 1 : 2;
      if (stepIndex !== currentStep) {
        currentStep = stepIndex;
        popSteps.forEach(function (el, i) { el.classList.toggle('is-active', i === stepIndex); });
        if (popCount) popCount.textContent = '0' + (stepIndex + 1);
      }

      var scale = popVisual ? popVisual.clientWidth / 620 : 1;
      popKernels.forEach(function (k, i) {
        var start = 0.04 + (i / popKernels.length) * 0.6;
        var t = clamp((p - start) / 0.28, 0, 1);
        if (t <= 0) {
          k.style.opacity = '0';
          return;
        }
        var e = easeOut(t);
        var tx = parseFloat(k.dataset.tx || 0) * e * scale;
        var ty = parseFloat(k.dataset.ty || 0) * e * scale;
        var rot = parseFloat(k.dataset.rot || 0) * e;
        var s = 0.35 + 0.65 * e;
        k.style.opacity = String(clamp(t * 3, 0, 1));
        k.style.transform = 'translate3d(calc(-50% + ' + tx.toFixed(1) + 'px), calc(-50% + ' + ty.toFixed(1) + 'px), 0) rotate(' + rot.toFixed(1) + 'deg) scale(' + s.toFixed(3) + ')';
      });
    };

    var popRequest = function () {
      if (!popTick) {
        popTick = true;
        window.requestAnimationFrame(popUpdate);
      }
    };

    if (reduceMotion) {
      popSteps.forEach(function (el) { el.classList.add('is-active'); });
    } else {
      window.addEventListener('scroll', popRequest, { passive: true });
      window.addEventListener('resize', popRequest);
      popUpdate();
    }
  }

  /* ---------- Flavor filters ---------- */
  var filterBar = $('[data-flavor-filters]');
  if (filterBar) {
    var filterBtns = $$('[data-filter]', filterBar);
    var flavorCards = $$('.flavor-card[data-cat]');
    var countEl = $('[data-flavor-count]');

    var applyFilter = function (cat) {
      var shown = 0;
      flavorCards.forEach(function (card) {
        var show = cat === 'all' || card.dataset.cat === cat;
        card.hidden = !show;
        if (show) {
          shown++;
          card.classList.remove('is-shown');
          // restart the entrance animation
          void card.offsetWidth;
          card.classList.add('is-shown');
        }
      });
      if (countEl) countEl.textContent = String(shown);
    };

    filterBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        filterBtns.forEach(function (b) { b.setAttribute('aria-pressed', String(b === btn)); });
        applyFilter(btn.dataset.filter);
      });
    });

    applyFilter('all');

    // Landing on /flavors/#sweet (or another category) opens that filter.
    var hashCat = (window.location.hash || '').replace('#', '');
    var hashBtn = filterBtns.filter(function (b) { return b.dataset.filter === hashCat; })[0];
    if (hashBtn) {
      hashBtn.click();
      var grid = $('.flavor-page-grid');
      window.setTimeout(function () {
        if (grid) grid.scrollIntoView({ behavior: 'auto', block: 'start' });
      }, 80);
    }
  }

  /* ---------- Quote form ---------- */
  var form = $('[data-quote-form]');
  if (form) {
    var groups = {
      catering: $('[data-group="catering"]', form),
      fundraising: $('[data-group="fundraising"]', form)
    };
    var radios = $$('input[name="requestType"]', form);
    var errorBox = $('[data-form-error]', form);
    var success = $('[data-form-success]');
    var formPanel = $('[data-form-panel]');
    var successMsg = $('[data-success-message]', success || document);
    var dateInput = $('input[name="eventDate"]', form);
    var honeypot = $('input[name="website"]', form);
    var packageSelect = $('select[name="packageInterest"]', form);

    if (dateInput) {
      var today = new Date();
      var iso = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');
      dateInput.min = iso;
    }

    var setGroup = function (name, on) {
      var group = groups[name];
      if (!group) return;
      group.hidden = !on;
      $$('input, select, textarea', group).forEach(function (el) {
        el.disabled = !on;
      });
    };

    var syncType = function () {
      var type = (radios.filter(function (r) { return r.checked; })[0] || {}).value || 'catering';
      setGroup('catering', type === 'catering');
      setGroup('fundraising', type === 'fundraising');
    };
    radios.forEach(function (r) { r.addEventListener('change', syncType); });

    // Pre-select catering/fundraising and package from links like
    // /contact/?type=fundraising or /contact/?package=deluxe.
    var params = new URLSearchParams(window.location.search);
    var wantedType = params.get('type');
    var wantedPackage = params.get('package');
    if (wantedType) {
      var wantedRadio = radios.filter(function (r) { return r.value === wantedType; })[0];
      if (wantedRadio) wantedRadio.checked = true;
    }
    if (wantedPackage && packageSelect) {
      var match = Array.prototype.some.call(packageSelect.options, function (opt) { return opt.value === wantedPackage; });
      if (match) packageSelect.value = wantedPackage;
    }
    syncType();

    var setError = function (msg) {
      if (!errorBox) return;
      errorBox.textContent = msg || '';
      errorBox.classList.toggle('is-visible', Boolean(msg));
    };

    var showSuccess = function (payload) {
      if (success) {
        var nameEl = $('[data-success-name]', success);
        if (nameEl && payload.name) nameEl.textContent = ', ' + payload.name.split(' ')[0];
        if (successMsg && CONFIG.formEndpoint) {
          successMsg.textContent = 'Your request is on its way to Andre. We\'ll get back to you about availability, flavors and a quote. Prefer to talk? Call (213) 479-4643.';
        }
        success.classList.add('is-visible');
        success.setAttribute('tabindex', '-1');
        success.focus({ preventScroll: true });
        success.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
      }
      if (formPanel) formPanel.hidden = true;
    };

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      setError('');

      if (!form.checkValidity()) {
        form.reportValidity();
        setError('Please fill in the highlighted fields so we can quote your event.');
        return;
      }

      var data = {};
      new FormData(form).forEach(function (value, key) {
        if (value) data[key] = String(value);
      });
      if (!data.requestType) data.requestType = 'catering';

      // Honeypot: real people never fill this hidden field.
      if (honeypot && honeypot.value.trim()) {
        showSuccess({ name: data.name });
        return;
      }
      delete data.website;

      track('quote_request', {
        request_type: data.requestType,
        package_interest: data.packageInterest || 'not_sure'
      });

      if (CONFIG.formEndpoint) {
        var submitBtn = $('button[type="submit"]', form);
        if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Sending…'; }
        fetch(CONFIG.formEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(data)
        }).then(function (res) {
          if (!res.ok) throw new Error('Bad response');
          showSuccess(data);
          window.setTimeout(function () { window.location.assign('/thank-you/'); }, 1600);
        }).catch(function () {
          setError('Something went wrong sending your request. Please call (213) 479-4643 or email ' + CONFIG.email + '.');
        }).finally(function () {
          if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Send My Request'; }
        });
        return;
      }

      var lines = [
        'New ' + (data.requestType === 'fundraising' ? 'fundraising' : 'catering') + ' request',
        '',
        'Name: ' + (data.name || ''),
        'Phone: ' + (data.phone || ''),
        'Email: ' + (data.email || '')
      ];
      if (data.requestType === 'catering') {
        lines.push('Event date: ' + (data.eventDate || ''),
          'Event city / zip: ' + (data.eventCity || ''),
          'Guest count: ' + (data.guestCount || ''),
          'Package interest: ' + (data.packageInterest || 'Not sure'));
      } else {
        lines.push('Organization: ' + (data.organization || ''),
          'Group size (sellers): ' + (data.groupSize || ''),
          'Fundraising goal: ' + (data.fundGoal || 'Not specified'));
      }
      if (data.notes) lines.push('', 'Notes: ' + data.notes);
      lines.push('', 'Sent from mrpopcornman.com');

      var mailto = 'mailto:' + CONFIG.email +
        '?subject=' + encodeURIComponent('Quote request — ' + (data.requestType === 'fundraising' ? 'Fundraiser' : 'Catering') + ' — ' + (data.name || '')) +
        '&body=' + encodeURIComponent(lines.join('\n'));

      window.location.href = mailto;
      showSuccess(data);
    });

    $$('input, select, textarea', form).forEach(function (field) {
      field.addEventListener('input', function () { setError(''); });
    });

    var resetLink = $('[data-form-reset]');
    if (resetLink) {
      resetLink.addEventListener('click', function (e) {
        e.preventDefault();
        form.reset();
        formPanel.hidden = false;
        if (success) success.classList.remove('is-visible');
        syncType();
        setError('');
        form.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
      });
    }
  }

  /* ---------- Year ---------- */
  $$('[data-year]').forEach(function (el) { el.textContent = String(new Date().getFullYear()); });
})();
