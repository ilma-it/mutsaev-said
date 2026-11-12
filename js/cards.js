/* ===================================================
   EXPANDING ACCORDION PHOTO CARDS CONTROLLER
   =================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const cards = document.querySelectorAll('.expand-card');

  cards.forEach((card) => {
    // Click behavior (especially helpful on touch screens and mobile)
    card.addEventListener('click', (e) => {
      // If clicking directly on the action button/link, allow navigation
      if (e.target.closest('.expand-btn') || e.target.closest('a')) {
        return;
      }

      // If already active, navigate to data-href
      if (card.classList.contains('active')) {
        const href = card.getAttribute('data-href');
        if (href) window.location.href = href;
        return;
      }

      // Otherwise activate this card and deactivate others
      cards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
    });
  });

  // Click outside closes active card
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.expand-card')) {
      cards.forEach(c => c.classList.remove('active'));
    }
  });
});
