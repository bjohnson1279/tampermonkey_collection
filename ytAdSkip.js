// ==UserScript==
// @name         YouTube Auto Skip Ad (Tampermonkey)
// @namespace    https://example.com/
// @version      1.1
// @description  Automatically clicks the YouTube "Skip Ad" button when it appears (conservative, throttled, mutation-observer + fallback). Use at your own risk.
// @author       Assistant
// @match        https://www.youtube.com/*
// @match        https://music.youtube.com/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function () {
  'use strict';

  // Configuration
  const CHECK_INTERVAL_MS = 500;     // periodic fallback check
  const CLICK_THROTTLE_MS = 3000;    // minimum ms between skip clicks per page

  let lastClick = 0;

  function isVisible(elem) {
    if (!elem) return false;
    try {
      const style = window.getComputedStyle(elem);
      if (!style || style.display === 'none' || style.visibility === 'hidden') return false;
      // offsetParent null is quick way to detect display:none or not in layout (but fails for fixed elements sometimes)
      if (elem.offsetParent === null && style.position !== 'fixed' && style.position !== 'sticky') return false;
      return true;
    } catch (e) {
      return false;
    }
  }

  function clickIfSkipButton(btn) {
    if (!btn) return false;
    if (!isVisible(btn)) return false;
    const now = Date.now();
    if (now - lastClick < CLICK_THROTTLE_MS) return false; // throttle
    try {
      btn.click();
      lastClick = now;
      console.debug('[YT-AutoSkip] Clicked skip button', btn);
      return true;
    } catch (e) {
      console.warn('[YT-AutoSkip] Failed to click skip button', e);
      return false;
    }
  }

  function findAndClickSkip() {
    // Primary selectors observed in YouTube players
    const selectors = [
      'button.ytp-ad-skip-button.ytp-button',           // standard skip button
      'button.ytp-ad-overlay-close-button',             // overlay close (sometimes)
      'button[aria-label="Skip ad"]',                   // ARIA label variant
      '.ytp-ad-skip-button'                             // fallback
    ];

    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (el && clickIfSkipButton(el)) return true;
    }

    // Another fallback: look for a visible element with innerText like "Skip Ad" / "Skip ads"
    const candidates = Array.from(document.querySelectorAll('button,div'))
      .filter(n => n && n.innerText)
      .filter(n => /\bskip ad(s)?\b/i.test(n.innerText.trim()));
    for (const c of candidates) {
      if (clickIfSkipButton(c)) return true;
    }

    return false;
  }

  // Run an initial attempt
  findAndClickSkip();

  // MutationObserver to catch dynamic UI changes quickly
  const observer = new MutationObserver((mutations) => {
    // Quick check for common added nodes could be added, but doing a lightweight unconditional check is fine here.
    findAndClickSkip();
  });
  observer.observe(document.documentElement, { childList: true, subtree: true, attributes: false });

  // Periodic fallback in case MutationObserver misses something
  const intervalId = setInterval(() => {
    findAndClickSkip();
  }, CHECK_INTERVAL_MS);

  // Optional: stop trying if user navigates away from youtube/video page — keep it simple:
  // When the page is unloaded, clean up.
  window.addEventListener('beforeunload', () => {
    try { clearInterval(intervalId); observer.disconnect(); } catch (e) {}
  });

  // Helpful console message
  console.info('[YT-AutoSkip] Running. Will attempt to click visible Skip buttons. Use responsibly.');
})();
