'use strict';

// Native dialog contains focus and supports Escape to close.
const lightbox = document.querySelector('#video-lightbox');
const enlargedVideo = document.querySelector('#lightbox-video');
const videoStatus = document.querySelector('#lightbox-status');
let videoTrigger = null;
document.querySelectorAll('.publication-image[data-full-video]').forEach(button => {
  button.addEventListener('click', () => {
    videoTrigger = button;
    const preview = button.querySelector('video');
    document.querySelector('#lightbox-title').textContent = button.dataset.videoTitle;
    enlargedVideo.setAttribute('aria-label', button.dataset.videoTitle + ' method animation');
    enlargedVideo.poster = preview.poster;
    enlargedVideo.src = button.dataset.fullVideo;
    enlargedVideo.muted = true;
    videoStatus.textContent = 'Loading video…';
    lightbox.showModal();
    document.body.classList.add('lightbox-open');
    enlargedVideo.play().catch(() => {
      if (lightbox.open && !enlargedVideo.error) videoStatus.textContent = 'Press play to watch the video.';
    });
  });
});
enlargedVideo.addEventListener('playing', () => {
  videoStatus.textContent = '';
});
enlargedVideo.addEventListener('error', () => {
  if (lightbox.open) videoStatus.textContent = 'The video could not load. Close and try again.';
});
document.querySelector('#lightbox-close').addEventListener('click', () => lightbox.close());
lightbox.addEventListener('click', event => {
  const rect = lightbox.getBoundingClientRect();
  if (event.target === lightbox && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) lightbox.close();
});
lightbox.addEventListener('close', () => {
  enlargedVideo.pause();
  enlargedVideo.removeAttribute('src');
  enlargedVideo.load();
  videoStatus.textContent = '';
  document.body.classList.remove('lightbox-open');
  videoTrigger?.focus({ preventScroll: true });
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
