'use strict';

// Native dialog provides keyboard focus containment and Escape to close.
const lightbox = document.querySelector('#image-lightbox');
const enlargedImage = document.querySelector('#lightbox-image');
const imageViewport = document.querySelector('.lightbox-viewport');
const imageStatus = document.querySelector('#lightbox-status');
const zoomButton = document.querySelector('#lightbox-zoom');
let imageTrigger = null;
function fitFigure() {
  imageViewport.classList.remove('is-zoomed');
  enlargedImage.style.width = '';
  zoomButton.setAttribute('aria-pressed', 'false');
  zoomButton.textContent = 'Zoom in';
}
document.querySelectorAll('.publication-image[data-full-image]').forEach(button => {
  button.addEventListener('click', () => {
    imageTrigger = button;
    fitFigure();
    enlargedImage.hidden = true;
    imageStatus.textContent = 'Loading figure…';
    document.querySelector('#lightbox-title').textContent = button.dataset.imageTitle;
    enlargedImage.alt = button.querySelector('img').alt;
    enlargedImage.src = button.dataset.fullImage;
    lightbox.showModal();
    document.body.classList.add('lightbox-open');
  });
});
enlargedImage.addEventListener('load', () => {
  enlargedImage.hidden = false;
  imageStatus.textContent = '';
});
enlargedImage.addEventListener('error', () => {
  imageStatus.textContent = 'The figure could not load. Close and try again.';
});
zoomButton.addEventListener('click', () => {
  if (imageViewport.classList.contains('is-zoomed')) return fitFigure();
  if (!enlargedImage.naturalWidth) return;
  enlargedImage.style.width = Math.min(enlargedImage.naturalWidth, imageViewport.clientWidth * 2) + 'px';
  imageViewport.classList.add('is-zoomed');
  zoomButton.setAttribute('aria-pressed', 'true');
  zoomButton.textContent = 'Fit image';
});
document.querySelector('#lightbox-close').addEventListener('click', () => lightbox.close());
lightbox.addEventListener('click', event => {
  const rect = lightbox.getBoundingClientRect();
  if (event.target === lightbox && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) lightbox.close();
});
lightbox.addEventListener('close', () => {
  document.body.classList.remove('lightbox-open');
  fitFigure();
  imageTrigger?.focus({ preventScroll: true });
});

// Load the third-party viewer after an explicit request. Drive's PDF viewer
// can focus itself and move the parent page when it loads during first paint.
const slideViewer = document.querySelector('.slides-viewer iframe');
const slidePlaceholder = document.querySelector('.slides-placeholder');
function openSlides() {
  if (slideViewer.hasAttribute('src')) return;
  slideViewer.src = slideViewer.dataset.src;
  slideViewer.hidden = false;
  slidePlaceholder.hidden = true;
}
document.querySelector('#open-slides').addEventListener('click', openSlides);
document.querySelectorAll('a[href="#research-talk"]').forEach(link => {
  link.addEventListener('click', openSlides);
});
