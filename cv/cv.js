'use strict';

// Only explicit video-demo links receive previews. Other links stay ordinary links.
const preview = document.querySelector('#video-preview');
const media = document.querySelector('#preview-media');
const previewTitle = document.querySelector('#preview-title');
const openLink = document.querySelector('#preview-open-link');
const closeButton = document.querySelector('#close-video-preview');
const videoLinks = [...document.querySelectorAll('a[data-video-src], a[data-youtube-id]')];
let activeLink = null;
let closeTimer = null;
let focusTimer = null;
let suppressFocusPreview = false;
function cancelClose() { clearTimeout(closeTimer); }
function hidePreview() {
  cancelClose();
  clearTimeout(focusTimer);
  if (activeLink) activeLink.setAttribute('aria-expanded', 'false');
  media.querySelector('video')?.pause();
  media.replaceChildren();
  preview.hidden = true;
  activeLink = null;
}
function positionPreview(link) {
  const rect = link.getBoundingClientRect();
  const width = preview.offsetWidth;
  const height = preview.offsetHeight;
  const left = Math.max(12, Math.min(rect.left, innerWidth - width - 12));
  let top = rect.bottom + 8;
  if (top + height > innerHeight - 12) top = Math.max(12, rect.top - height - 8);
  preview.style.left = left + 'px';
  preview.style.top = top + 'px';
}
function showPreview(link) {
  cancelClose();
  if (activeLink === link && !preview.hidden) return;
  hidePreview();
  activeLink = link;
  link.setAttribute('aria-expanded', 'true');
  previewTitle.textContent = link.dataset.previewTitle;
  openLink.href = link.href;
  if (link.dataset.videoSrc) {
    const video = document.createElement('video');
    video.muted = true; video.defaultMuted = true;
    video.autoplay = true; video.loop = true; video.playsInline = true;
    video.controls = true; video.preload = 'metadata';
    video.setAttribute('aria-label', link.dataset.previewTitle);
    video.src = link.dataset.videoSrc;
    media.append(video);
    video.play().catch(() => {});
  } else {
    const frame = document.createElement('iframe');
    frame.title = link.dataset.previewTitle;
    frame.allow = 'autoplay; encrypted-media; fullscreen; picture-in-picture';
    frame.src = 'https://www.youtube-nocookie.com/embed/' + link.dataset.youtubeId + '?autoplay=1&mute=1&playsinline=1&rel=0';
    media.append(frame);
  }
  preview.hidden = false;
  positionPreview(link);
}
function scheduleClose() {
  cancelClose();
  closeTimer = setTimeout(() => {
    if (preview.matches(':hover') || activeLink?.matches(':hover')) return;
    if (preview.contains(document.activeElement) || document.activeElement === activeLink) return;
    hidePreview();
  }, 220);
}
videoLinks.forEach(link => {
  link.setAttribute('aria-controls', 'video-preview');
  link.setAttribute('aria-expanded', 'false');
  link.addEventListener('pointerenter', event => {
    if (event.pointerType !== 'touch') showPreview(link);
  });
  link.addEventListener('pointerleave', scheduleClose);
  link.addEventListener('focus', () => {
    if (suppressFocusPreview) return;
    clearTimeout(focusTimer);
    // Let focus-driven scrolling finish before positioning a keyboard preview.
    focusTimer = setTimeout(() => {
      if (document.activeElement === link) showPreview(link);
    }, 500);
  });
  link.addEventListener('blur', scheduleClose);
});
preview.addEventListener('pointerenter', cancelClose);
preview.addEventListener('pointerleave', scheduleClose);
preview.addEventListener('focusout', scheduleClose);
closeButton.addEventListener('click', () => {
  const previousLink = activeLink;
  hidePreview();
  // Restore focus without immediately reopening a dismissed preview.
  suppressFocusPreview = true;
  if (previousLink) previousLink.focus({ preventScroll: true });
  suppressFocusPreview = false;
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') hidePreview();
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden) hidePreview();
});
window.addEventListener('scroll', () => {
  if (!activeLink) return;
  const rect = activeLink.getBoundingClientRect();
  if (rect.bottom < 0 || rect.top > innerHeight) hidePreview();
  else positionPreview(activeLink);
}, { passive: true });
window.addEventListener('resize', hidePreview);
