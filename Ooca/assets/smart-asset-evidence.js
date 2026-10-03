(() => {
  const section = document.querySelector('.flow-evidence');
  if (!section) return;
  const dialog = section.querySelector('.flow-diagram');
  const image = dialog.querySelector('img');
  const viewport = dialog.querySelector('.flow-diagram-viewport');
  const loading = dialog.querySelector('.flow-diagram-loading');
  const error = dialog.querySelector('.flow-diagram-error');
  let trigger;

  image.addEventListener('load', () => { loading.hidden = true; });
  image.addEventListener('error', () => { loading.hidden = true; image.hidden = true; error.hidden = false; });
  section.querySelectorAll('[data-flow-image]').forEach(button => {
    button.addEventListener('click', () => {
      trigger = button;
      dialog.querySelector('#flow-diagram-title').textContent = button.querySelector('strong').textContent;
      dialog.querySelector('#flow-diagram-description').textContent = button.querySelector('.flow-evidence-description').textContent;
      dialog.querySelector('.flow-diagram-original').href = button.dataset.flowImage;
      image.alt = button.dataset.caption;
      image.hidden = false;
      error.hidden = true;
      loading.hidden = false;
      image.src = button.dataset.flowImage;
      if (image.complete && image.naturalWidth > 0) loading.hidden = true;
      dialog.showModal();
      document.body.classList.add('flow-diagram-open');
      viewport.scrollTop = viewport.scrollLeft = 0;
    });
  });
  dialog.querySelector('.flow-diagram-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {
    document.body.classList.remove('flow-diagram-open');
    trigger?.focus({ preventScroll: true });
  });
})();
