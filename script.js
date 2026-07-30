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

// ENQUIRY PLANNER
const planner = document.querySelector('#enquiry-planner');
const plannerForm = planner?.querySelector('form');
const summaryField = document.querySelector('[data-enquiry-summary]');
const summaryLabel = summaryField?.closest('.planner-summary');
const generateButton = document.querySelector('[data-generate-enquiry]');
const copyButton = document.querySelector('[data-copy-enquiry]');
const shareButton = document.querySelector('[data-share-enquiry]');
const liveStatus = document.querySelector('[data-live-status]');
let plannerTrigger = null;

function showToast(message) {
  if (!liveStatus) return;
  liveStatus.textContent = message;
  liveStatus.classList.add('show');
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    liveStatus.classList.remove('show');
    liveStatus.textContent = '';
  }, 3500);
}

function buildEnquirySummary() {
  if (!plannerForm) return '';
  const data = new FormData(plannerForm);
  const clean = (name) => String(data.get(name) || '').trim() || 'Not specified';
  return [
    'Hello Ready Maid, I would like help choosing a suitable helper.',
    `Location: ${clean('location')}`,
    `Household members: ${clean('household')}`,
    `Main duties: ${clean('duties')}`,
    `Preferred start date: ${clean('start')}`
  ].join('\n');
}

function showPreparedSummary() {
  if (!summaryField || !summaryLabel) return '';
  const summary = buildEnquirySummary();
  summaryField.value = summary;
  summaryLabel.hidden = false;
  if (copyButton) copyButton.hidden = false;
  if (shareButton && navigator.share) shareButton.hidden = false;
  summaryField.focus({ preventScroll: true });
  summaryField.select();
  summaryField.scrollIntoView({ behavior: reducedMotion.matches ? 'auto' : 'smooth', block: 'nearest' });
  return summary;
}

function openPlanner(trigger) {
  if (!planner) return;
  plannerTrigger = trigger || document.activeElement;
  if (typeof planner.showModal === 'function') planner.showModal();
  else {
    planner.setAttribute('open', '');
    planner.classList.add('dialog-fallback-open');
    document.body.classList.add('dialog-open');
  }
  window.setTimeout(() => planner.querySelector('input, textarea, button')?.focus(), 0);
}

function closePlanner() {
  if (!planner) return;
  if (typeof planner.close === 'function' && planner.open) planner.close();
  else {
    planner.removeAttribute('open');
    planner.classList.remove('dialog-fallback-open');
    document.body.classList.remove('dialog-open');
    plannerTrigger?.focus?.();
  }
}

document.querySelectorAll('[data-open-planner]').forEach((button) => {
  button.addEventListener('click', () => openPlanner(button));
});
plannerForm?.addEventListener('submit', (event) => event.preventDefault());
planner?.addEventListener('close', () => {
  document.body.classList.remove('dialog-open');
  plannerTrigger?.focus?.();
});
planner?.querySelectorAll('[value="cancel"]').forEach((button) => {
  button.addEventListener('click', (event) => {
    event.preventDefault();
    closePlanner();
  });
});

generateButton?.addEventListener('click', () => {
  showPreparedSummary();
  showToast('Your enquiry summary is ready.');
});

async function copyText(text) {
  if (navigator.clipboard?.writeText && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return true;
  }
  if (!summaryField) return false;
  summaryField.focus();
  summaryField.select();
  return document.execCommand?.('copy') === true;
}

copyButton?.addEventListener('click', async () => {
  const summary = summaryField?.value || showPreparedSummary();
  try {
    const copied = await copyText(summary);
    showToast(copied ? 'Your enquiry summary has been copied.' : 'The summary is selected for manual copying.');
  } catch {
    summaryField?.focus();
    summaryField?.select();
    showToast('Automatic copy was blocked. The summary is selected for manual copying.');
  }
});

shareButton?.addEventListener('click', async () => {
  const summary = summaryField?.value || showPreparedSummary();
  if (!navigator.share) return;
  try {
    await navigator.share({ title: 'Ready Maid enquiry', text: summary });
  } catch (error) {
    if (error?.name !== 'AbortError') showToast('Sharing was unavailable. You can copy the visible summary instead.');
  }
});

planner?.addEventListener('click', (event) => {
  if (event.target === planner) closePlanner();
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && planner?.hasAttribute('open')) closePlanner();
});

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
