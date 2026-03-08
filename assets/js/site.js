function toggleMenu() {
  const button = document.querySelector('[data-menu-toggle]');
  const nav = document.querySelector('[data-menu]');
  if (!button || !nav) return;
  button.addEventListener('click', () => nav.classList.toggle('is-open'));
}

function attachCopyHandlers() {
  document.querySelectorAll('[data-copy-target]').forEach((button) => {
    button.addEventListener('click', async () => {
      const target = document.getElementById(button.dataset.copyTarget);
      if (!target) return;
      const text = target.value !== undefined ? target.value : target.textContent;
      try {
        await navigator.clipboard.writeText(text || '');
        const original = button.textContent;
        button.textContent = 'Copied';
        setTimeout(() => { button.textContent = original; }, 1200);
      } catch (error) {
        console.error(error);
      }
    });
  });
}

function attachFaqHandlers() {
  document.querySelectorAll('.faq-item').forEach((item) => {
    const button = item.querySelector('.faq-question');
    if (!button) return;
    button.addEventListener('click', () => {
      item.classList.toggle('is-open');
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  toggleMenu();
  attachCopyHandlers();
  attachFaqHandlers();
});
