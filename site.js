'use strict';

// Pre-filter previews for the actual screen density instead of downscaling
// the full-resolution video with the browser's fast texture sampler.
const previewWidths = [384, 480, 640, 800, 960, 1280, 1920];
const previewVideos = [...document.querySelectorAll('video[data-preview-base]')];
function refreshPreviewSources() {
  previewVideos.forEach(video => {
    if (video.dataset.previewFallback === 'true') return;
    const rect = video.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const style = getComputedStyle(video);
    const width = rect.width - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
    const height = rect.height - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom);
    const pixels = Math.min(width, height * 16 / 9) * (window.devicePixelRatio || 1);
    const selectedWidth = previewWidths.find(size => size >= pixels);
    const base = video.dataset.previewBase;
    const revision = video.dataset.videoVersion ? '?v=' + encodeURIComponent(video.dataset.videoVersion) : '';
    const source = (selectedWidth ? base + '-preview-' + selectedWidth + '.mp4' : base + '.mp4') + revision;
    video.dataset.previewWidth = selectedWidth || 'original';
    const currentSource = video.getAttribute('src') || video.querySelector('source')?.getAttribute('src');
    if (currentSource === source) return;
    const position = video.currentTime;
    video.addEventListener('loadedmetadata', () => {
      if (position && Number.isFinite(video.duration)) video.currentTime = Math.min(position, video.duration - 0.01);
    }, { once: true });
    video.src = source;
    video.load();
    video.play().catch(() => {});
  });
}
let previewResizeTimer;
function schedulePreviewRefresh() {
  clearTimeout(previewResizeTimer);
  previewResizeTimer = setTimeout(refreshPreviewSources, 150);
}
previewVideos.forEach(video => {
  const useOriginal = () => {
    if (video.dataset.previewFallback === 'true') return;
    video.dataset.previewFallback = 'true';
    const revision = video.dataset.videoVersion ? '?v=' + encodeURIComponent(video.dataset.videoVersion) : '';
    video.src = video.dataset.previewBase + '.mp4' + revision;
    video.load();
    video.play().catch(() => {});
  };
  video.addEventListener('error', useOriginal);
  video.querySelector('source')?.addEventListener('error', useOriginal);
});
if (typeof ResizeObserver !== 'undefined') {
  const previewObserver = new ResizeObserver(schedulePreviewRefresh);
  previewVideos.forEach(video => previewObserver.observe(video));
}
window.addEventListener('resize', schedulePreviewRefresh);
refreshPreviewSources();

// Native dialog contains focus and supports Escape to close.
const lightbox = document.querySelector('#video-lightbox');
const enlargedVideo = document.querySelector('#lightbox-video');
const videoStatus = document.querySelector('#lightbox-status');
let videoTrigger = null;
document.querySelectorAll('[data-full-video]').forEach(button => {
  button.addEventListener('click', () => {
    videoTrigger = button;
    const preview = button.dataset.previewSelector ? document.querySelector(button.dataset.previewSelector) : button.querySelector('video');
    document.querySelector('#lightbox-title').textContent = button.dataset.videoTitle;
    enlargedVideo.setAttribute('aria-label', button.dataset.videoTitle + ' video');
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
