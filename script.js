// READY MAID RESPONSIVE HOMEPAGE V1.5 — MAXIMUM ASSET-FREE TECHNICAL POLISH
'use strict';

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const navLinks = [...document.querySelectorAll('.desktop-nav a')];
const sections = navLinks
  .map((link) => document.querySelector(link.getAttribute('href')))
  .filter(Boolean);

if ('IntersectionObserver' in window) {
  const navObserver = new IntersectionObserver((entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    navLinks.forEach((link) => {
      const active = link.getAttribute('href') === `#${visible.target.id}`;
      link.classList.toggle('active', active);
      if (active) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
  }, { rootMargin: '-32% 0px -58% 0px', threshold: [0.05, 0.2, 0.5] });
  sections.forEach((section) => navObserver.observe(section));
}

// MOBILE NAVIGATION
const menuToggle = document.querySelector('.menu-toggle');
const primaryNav = document.querySelector('#primary-nav');
if (menuToggle && primaryNav) {
  const closeMenu = ({ returnFocus = false } = {}) => {
    primaryNav.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Open navigation');
    if (returnFocus) menuToggle.focus();
  };
  menuToggle.addEventListener('click', () => {
    const open = !primaryNav.classList.contains('open');
    primaryNav.classList.toggle('open', open);
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    if (open) primaryNav.querySelector('a')?.focus();
  });
  primaryNav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => closeMenu()));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && primaryNav.classList.contains('open')) closeMenu({ returnFocus: true });
  });
  const desktopQuery = window.matchMedia('(min-width: 1280px)');
  const handleDesktop = (event) => { if (event.matches) closeMenu(); };
  desktopQuery.addEventListener?.('change', handleDesktop);
}

// RESTRAINED SCROLL REVEAL
if (!reducedMotion.matches && 'IntersectionObserver' in window) {
  const revealItems = document.querySelectorAll('.panel, .trust-strip, .contact-cta');
  revealItems.forEach((item) => item.classList.add('reveal-ready'));
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px' });
  revealItems.forEach((item) => revealObserver.observe(item));
}

// CURRENT YEAR AND RESILIENT IN-PAGE FOCUS
const year = document.querySelector('[data-current-year]');
if (year) year.textContent = String(new Date().getFullYear());
document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', () => {
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    window.setTimeout(() => target.setAttribute('tabindex', target.hasAttribute('tabindex') ? target.getAttribute('tabindex') : '-1'), 0);
  });
});


// GA4 EVENT TRACKING — Ready Maid Agency (G-8UEJ9M4TG3)
(function(){
  if(typeof gtag!=='function')return;
  function track(n,p){gtag('event',n,p||{});}

  // WhatsApp click — preventDefault + track + delayed navigate
  document.querySelectorAll('a[href*="wa.me"],a[href*="whatsapp"]').forEach(function(e){
    e.addEventListener('click',function(ev){
      ev.preventDefault();
      var url=e.href;
      track('whatsapp_click',{});
      setTimeout(function(){window.open(url,'_blank');},300);
    });
  });

  // Phone click — preventDefault + track + delayed navigate
  document.querySelectorAll('a[href^="tel:"]').forEach(function(e){
    e.addEventListener('click',function(ev){
      ev.preventDefault();
      var url=e.href;
      track('phone_click',{});
      setTimeout(function(){location.href=url;},300);
    });
  });

  // Email click — preventDefault + track + delayed navigate
  document.querySelectorAll('a[href^="mailto:"]').forEach(function(e){
    e.addEventListener('click',function(ev){
      ev.preventDefault();
      var url=e.href;
      track('email_click',{});
      setTimeout(function(){location.href=url;},300);
    });
  });

  // Prepare enquiry CTA click
  document.querySelectorAll('.button-primary,[class*="cta"],[class*="enquiry"]').forEach(function(e){
    e.addEventListener('click',function(){track('prepare_enquiry_click',{button_text:e.textContent.trim()});});
  });

  // Form start (focus on any form field)
  document.querySelectorAll('form input,form textarea,form select').forEach(function(e){
    e.addEventListener('focus',function(){
      var f=e.closest('form');
      track('form_start',{form_id:f?f.id:'unknown'});
    },{once:true});
  });

  // Form submit (only after genuine submission)
  document.querySelectorAll('form').forEach(function(f){
    f.addEventListener('submit',function(){
      if(f.checkValidity()){track('form_submit',{form_id:f.id||'unknown'});}
    });
  });

  // Service view (scroll-based)
  if('IntersectionObserver' in window){
    var sObs=new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(e.isIntersecting){
          track('service_view',{service:e.target.id||e.target.dataset.service||'unknown'});
          sObs.unobserve(e.target);
        }
      });
    },{threshold:0.5});
    document.querySelectorAll('[data-service],.service-card,[id*="service"]').forEach(function(e){sObs.observe(e);});
  }

  // Map direction click
  document.querySelectorAll('a[href*="maps.google"],a[href*="google.com/maps"],[data-action="directions"]').forEach(function(e){
    e.addEventListener('click',function(){track('map_direction_click',{destination:'readymaid.my office'});});
  });

  // PWA install app click
  window.addEventListener('beforeinstallprompt',function(e){
    e.preventDefault();window._deferredPrompt=e;
    document.querySelectorAll('[data-action="install-app"],.install-btn').forEach(function(el){
      el.addEventListener('click',function(){track('install_app_click',{});window._deferredPrompt.prompt();});
    });
  });
})();
