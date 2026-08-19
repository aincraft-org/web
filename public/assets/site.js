(() => {
  const masthead = document.querySelector('[data-masthead]');
  if (masthead) {
    const sync = () => masthead.setAttribute('data-stuck', String(window.scrollY > 12));
    sync();
    window.addEventListener('scroll', sync, { passive: true });
  }

  for (const button of document.querySelectorAll('[data-copy-text]')) {
    button.addEventListener('click', async () => {
      const text = button.dataset.copyText;
      const label = button.textContent;
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        const field = document.createElement('input');
        field.value = text;
        document.body.append(field);
        field.select();
        document.execCommand('copy');
        field.remove();
      }
      button.dataset.copied = 'true';
      button.textContent = 'Copied';
      setTimeout(() => {
        delete button.dataset.copied;
        button.textContent = label;
      }, 1600);
    });
  }

  const revealed = document.querySelectorAll('.reveal');
  if (revealed.length && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.setAttribute('data-shown', 'true');
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: '0px 0px -12% 0px' },
    );
    for (const node of revealed) observer.observe(node);
  } else {
    for (const node of revealed) node.setAttribute('data-shown', 'true');
  }
})();
