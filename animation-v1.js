/* =========================================================
   SCROLL WORLD ANIMATION V1
   Zone interactions, route lines, zoom, service panel
   Ready Maid Agency
   ========================================================= */
(function () {
  'use strict';

  /* ---- Constants ---- */
  const STATES = {
    WORLD: 'world',
    ZOOMING: 'zooming',
    ZOOMED: 'zoomed',
    RETURNING: 'returning'
  };

  const ZONE_DATA = {
    penang: {
      title: 'PENANG',
      service: 'Elderly Care',
      description: 'Companionship, daily routines and practical household support.',
      linkHref: '#elderly',
      linkText: 'Learn More about Elderly Care'
    },
    johor: {
      title: 'JOHOR',
      service: 'Baby & Child Care',
      description: 'Support for babies, children and the changing needs of growing families.',
      linkHref: '#baby',
      linkText: 'Learn More about Baby & Child Care'
    },
    kl: {
      title: 'KUALA LUMPUR',
      service: 'Home & Household Support',
      description: 'Practical help matched to your home routines and expectations.',
      linkHref: '#home-support',
      linkText: 'Learn More about Home Support'
    }
  };

  /* ---- DOM References ---- */
  const worldStage = document.querySelector('.world-stage');
  const zoneLabels = document.querySelectorAll('.world-label');
  const heroSection = document.querySelector('.hero');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let zoomScale = reducedMotion.matches ? 1 : 2.5;
  if (window.innerWidth <= 768) zoomScale = reducedMotion.matches ? 1 : 1.8;

  /* ---- State ---- */
  let state = STATES.WORLD;
  let activeZoneEl = null;
  let activeZoneId = null;

  /* ---- Create SVG Routes Overlay ---- */
  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('class', 'animation-routes');
  svg.setAttribute('viewBox', '0 0 100 100');
  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  svg.setAttribute('aria-hidden', 'true');

  // Create one path per zone
  const routePaths = {};
  zoneLabels.forEach(function (label) {
    var id = getZoneId(label);
    var path = document.createElementNS(svgNS, 'path');
    path.setAttribute('class', 'route-line route-' + id);
    path.setAttribute('data-zone', id);
    svg.appendChild(path);
    routePaths[id] = path;
  });
  worldStage.appendChild(svg);

  // Center glow dot
  var dot = document.createElement('div');
  dot.className = 'route-dot';
  worldStage.appendChild(dot);

  /* ---- Create Zoom Backdrop ---- */
  var backdrop = document.createElement('div');
  backdrop.className = 'zoom-backdrop';
  document.body.appendChild(backdrop);

  /* ---- Create Service Panel ---- */
  var panel = document.createElement('aside');
  panel.className = 'service-panel';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-modal', 'true');
  panel.setAttribute('aria-label', 'Service zone details');
  panel.setAttribute('tabindex', '-1');
  panel.innerHTML =
    '<button class="panel-close back-to-world-btn" type="button" aria-label="Close panel and return to world view">&times;</button>' +
    '<div class="service-panel-inner">' +
      '<p class="panel-kicker"></p>' +
      '<h3 class="panel-zone-name"></h3>' +
      '<p class="panel-service-type"></p>' +
      '<hr class="panel-divider" aria-hidden="true" />' +
      '<p class="panel-description"></p>' +
      '<div class="panel-actions">' +
        '<a class="panel-link button button-primary small" href="#">Learn More</a>' +
        '<button class="back-to-world" type="button">' +
          '<span class="arrow" aria-hidden="true">&larr;</span> Back to World' +
        '</button>' +
      '</div>' +
      '<p class="panel-hint">Press <kbd>Esc</kbd> to return</p>' +
    '</div>';
  document.body.appendChild(panel);

  /* ---- Helper Functions ---- */
  function getZoneId(el) {
    // classList: ["world-label", "penang"] etc.
    for (var i = 0; i < el.classList.length; i++) {
      var c = el.classList[i];
      if (c === 'penang' || c === 'johor' || c === 'kl') return c;
    }
    return null;
  }

  function getWorldRect() {
    return worldStage.getBoundingClientRect();
  }

  function getZonePosition(el) {
    var stageRect = getWorldRect();
    var zoneRect = el.getBoundingClientRect();
    return {
      x: ((zoneRect.left + zoneRect.width / 2) - stageRect.left) / stageRect.width * 100,
      y: ((zoneRect.top + zoneRect.height / 2) - stageRect.top) / stageRect.height * 100
    };
  }

  function updateRoutePath(id) {
    var el = document.querySelector('.world-label.' + id);
    if (!el) return;
    var pos = getZonePosition(el);
    var path = routePaths[id];
    if (!path) return;
    // Cubic bezier from center (50,50) to zone position
    var cx = 50;
    var cy = 50;
    var cp1x = cx + (pos.x - cx) * 0.3;
    var cp1y = cy;
    var cp2x = cx + (pos.x - cx) * 0.7;
    var cp2y = pos.y;
    path.setAttribute('d', 'M' + cx + ',' + cy + ' C' + cp1x + ',' + cp1y + ' ' + cp2x + ',' + cp2y + ' ' + pos.x + ',' + pos.y);
  }

  function updateAllRoutePaths() {
    zoneLabels.forEach(function (label) {
      var id = getZoneId(label);
      if (id) updateRoutePath(id);
    });
  }

  /* ---- Zoom Functions ---- */
  function applyZoom(el) {
    if (reducedMotion.matches) {
      worldStage.style.transform = 'none';
      worldStage.style.transformOrigin = '';
      return;
    }
    var pos = getZonePosition(el);
    var scale = window.innerWidth <= 768 ? 1.8 : zoomScale;
    worldStage.style.transformOrigin = pos.x + '% ' + pos.y + '%';
    worldStage.style.transform = 'scale(' + scale + ')';
  }

  function clearZoom() {
    worldStage.style.transform = '';
    worldStage.style.transformOrigin = '';
    worldStage.style.overflow = '';
  }

  /* ---- Service Panel ---- */
  function populatePanel(id) {
    var data = ZONE_DATA[id];
    if (!data) return;
    panel.querySelector('.panel-kicker').textContent = 'SERVICE ZONE';
    panel.querySelector('.panel-zone-name').textContent = data.title;
    panel.querySelector('.panel-service-type').textContent = data.service;
    panel.querySelector('.panel-description').textContent = data.description;
    var link = panel.querySelector('.panel-link');
    link.setAttribute('href', data.linkHref);
    link.textContent = data.linkText;
    panel.querySelector('.panel-kicker').style.color = '';
  }

  function showPanel() {
    panel.classList.add('open');
    panel.setAttribute('aria-hidden', 'false');
    // Focus the panel after transition
    setTimeout(function () {
      panel.querySelector('.back-to-world').focus();
    }, 200);
  }

  function hidePanel() {
    panel.classList.remove('open');
    panel.setAttribute('aria-hidden', 'true');
  }

  /* ---- State Transitions ---- */
  function enterWorld() {
    state = STATES.WORLD;
    worldStage.classList.remove('zoomed', 'zooming', 'returning');
    worldStage.classList.add('world');
    clearZoom();
    hidePanel();
    backdrop.classList.remove('active');
    svg.classList.remove('active');
    dot.classList.remove('active');
    // Reset all paths
    Object.keys(routePaths).forEach(function (id) {
      var p = routePaths[id];
      p.classList.remove('animating', 'drawn');
    });
    // Remove selected state
    zoneLabels.forEach(function (l) { l.classList.remove('selected'); });
    // Restore tabindex
    zoneLabels.forEach(function (l) { l.setAttribute('tabindex', '0'); });
    activeZoneEl = null;
    activeZoneId = null;
    // Re-enable text selection on hero
    heroSection.style.userSelect = '';
  }

  function startZoom(el, id) {
    if (state === STATES.ZOOMING || state === STATES.ZOOMED) return;
    state = STATES.ZOOMING;

    activeZoneEl = el;
    activeZoneId = id;

    // Disable text selection during animation
    heroSection.style.userSelect = 'none';

    // Mark zone as selected
    el.classList.add('selected');

    // Remove tabindex from other zones
    zoneLabels.forEach(function (l) {
      if (l !== el) l.setAttribute('tabindex', '-1');
    });

    // Show route line
    updateRoutePath(id);
    svg.classList.add('active');
    dot.classList.add('active');

    var path = routePaths[id];
    path.classList.remove('drawn');
    // Force reflow
    void path.offsetWidth;

    if (!reducedMotion.matches) {
      path.classList.add('animating');

      // After route line animation, apply zoom
      setTimeout(function () {
        path.classList.remove('animating');
        path.classList.add('drawn');
        applyZoom(el);
        if (!reducedMotion.matches) {
          worldStage.classList.add('zoomed');
          worldStage.classList.remove('world');
        }
        backdrop.classList.add('active');

        // Enter ZOOMED state after zoom transition
        setTimeout(function () {
          state = STATES.ZOOMED;
          populatePanel(id);
          showPanel();
        }, 750);
      }, 900);
    } else {
      // Reduced motion: skip route animation and zoom
      path.classList.add('drawn');
      applyZoom(el);
      backdrop.classList.add('active');
      worldStage.classList.add('zoomed');
      worldStage.classList.remove('world');
      state = STATES.ZOOMED;
      populatePanel(id);
      showPanel();
    }
  }

  function startReturn() {
    if (state !== STATES.ZOOMED) return;
    state = STATES.RETURNING;

    hidePanel();
    backdrop.classList.remove('active');
    worldStage.classList.remove('zoomed');
    worldStage.classList.add('returning');

    if (!reducedMotion.matches) {
      // Animate zoom out, then clean up
      setTimeout(function () {
        clearZoom();
        worldStage.classList.remove('returning');
        enterWorld();
      }, 650);
    } else {
      clearZoom();
      worldStage.classList.remove('returning');
      enterWorld();
    }
  }

  /* ---- Event Handlers ---- */

  // Zone click handler
  zoneLabels.forEach(function (label) {
    label.addEventListener('click', function (e) {
      e.preventDefault();
      if (state === STATES.ZOOMING || state === STATES.ZOOMED) return;
      var id = getZoneId(label);
      if (!id) return;
      startZoom(label, id);
    });

    // Keyboard: Enter/Space
    label.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (state === STATES.ZOOMING || state === STATES.ZOOMED) return;
        var id = getZoneId(label);
        if (!id) return;
        startZoom(label, id);
      }
    });

    // Accessibility
    label.setAttribute('role', 'button');
    label.setAttribute('tabindex', '0');
    var id = getZoneId(label);
    if (id) {
      label.setAttribute('aria-label', ZONE_DATA[id].title + ' — ' + ZONE_DATA[id].service + '. Click to explore.');
    }
  });

  // Back to World — from panel close button
  panel.querySelector('.panel-close').addEventListener('click', function () {
    startReturn();
  });

  // Back to World — from main back button
  panel.querySelector('.back-to-world').addEventListener('click', function () {
    startReturn();
  });

  // Backdrop click to return
  backdrop.addEventListener('click', function () {
    startReturn();
  });

  // Escape key to return
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && (state === STATES.ZOOMED || state === STATES.ZOOMING)) {
      e.preventDefault();
      startReturn();
    }
  });

  // Window resize — recalculate route paths
  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      updateAllRoutePaths();
      // Update zoom scale for mobile
      zoomScale = window.innerWidth <= 768 ? 1.8 : (reducedMotion.matches ? 1 : 2.5);
      // If zoomed, re-apply zoom with new position
      if (state === STATES.ZOOMED && activeZoneEl) {
        applyZoom(activeZoneEl);
      }
    }, 200);
  });

  // Reduced motion change listener
  reducedMotion.addEventListener('change', function () {
    zoomScale = reducedMotion.matches ? 1 : (window.innerWidth <= 768 ? 1.8 : 2.5);
    if (state === STATES.ZOOMED && activeZoneEl) {
      if (reducedMotion.matches) {
        clearZoom();
      } else {
        applyZoom(activeZoneEl);
      }
    }
  });

  /* ---- Init ---- */
  // Set initial state
  worldStage.classList.add('world');
  updateAllRoutePaths();
  // Recalculate on load (fonts/images may affect layout)
  if (document.readyState === 'complete') {
    updateAllRoutePaths();
  } else {
    window.addEventListener('load', updateAllRoutePaths);
  }
  // Also recalc after a short delay to ensure layout is settled
  setTimeout(updateAllRoutePaths, 500);

  /* Expose for debugging */
  window.__scrollWorld = {
    state: function () { return state; },
    enterWorld: enterWorld,
    startZoom: startZoom,
    startReturn: startReturn
  };

})();
