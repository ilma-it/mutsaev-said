/* ===================================================
   SHARED MAIN SCRIPTS & NAVIGATION
   =================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Reliable Active Link Detection
  const path = (window.location.pathname || '').toLowerCase();
  const links = document.querySelectorAll('.nav-link');

  let activeFound = false;
  links.forEach(link => {
    const href = (link.getAttribute('href') || '').toLowerCase();
    const cleanHref = href.replace('.html', '').replace('./', '');
    const cleanPath = path.split('/').pop().replace('.html', '');

    const isMatch = 
      (cleanPath === '' && (cleanHref === 'index' || cleanHref === '')) ||
      (cleanPath === 'index' && cleanHref === 'index') ||
      (cleanPath.includes('review') && cleanHref.includes('review')) ||
      (cleanPath.includes('model') && cleanHref.includes('model'));

    if (isMatch) {
      link.classList.add('active');
      activeFound = true;
    } else {
      link.classList.remove('active');
    }
  });

  // Fallback if URL is unusual (e.g. root domain or file protocol)
  if (!activeFound && links.length > 0) {
    if (path.includes('review')) {
      links[1]?.classList.add('active');
    } else if (path.includes('model')) {
      links[2]?.classList.add('active');
    } else {
      // If an element already had active class in HTML, keep it, otherwise activate first
      const hasActive = Array.from(links).some(l => l.classList.contains('active'));
      if (!hasActive) links[0]?.classList.add('active');
    }
  }

  // Smooth Scroll Reveal
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });

    document.querySelectorAll('.section, .gallery-block, .expand-card').forEach(el => {
      observer.observe(el);
    });
  } else {
    document.querySelectorAll('.section, .gallery-block, .expand-card').forEach(el => {
      el.classList.add('revealed');
    });
  }
});
