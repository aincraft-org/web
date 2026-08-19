(() => {
  const params = new URLSearchParams(window.location.search);
  const tabs = [...document.querySelectorAll('[data-category]')].filter((node) => node.tagName === 'BUTTON');
  const cards = [...document.querySelectorAll('[data-testid="product-card"]')];
  const search = document.querySelector('#store-search');
  const empty = document.querySelector('[data-testid="store-empty"]');
  const apply = () => {
    const category = params.get('category') || 'all';
    const query = (params.get('q') || '').trim().toLowerCase();
    let visible = 0;
    for (const card of cards) {
      const show = (category === 'all' || card.dataset.category === category) && (!query || card.dataset.search.includes(query));
      card.hidden = !show;
      if (show) visible++;
    }
    for (const tab of tabs) tab.setAttribute('aria-pressed', String((tab.dataset.category || 'all') === category));
    if (empty) empty.hidden = visible !== 0;
    if (search && search.value !== (params.get('q') || '')) search.value = params.get('q') || '';
  };
  const update = (key, value) => {
    if (value) params.set(key, value); else params.delete(key);
    history.replaceState(null, '', `${window.location.pathname}?${params}${window.location.hash}`);
    apply();
  };
  tabs.forEach((tab) => tab.addEventListener('click', () => update('category', tab.dataset.category === 'all' ? '' : tab.dataset.category)));
  search?.addEventListener('input', () => update('q', search.value));
  apply();
})();
