( () => {
    const buttons = [...document.querySelectorAll('[data-filter]')];
    const cards = [...document.querySelectorAll('[data-category]')];
    const result = document.querySelector('#results-count');
    if (!buttons.length)
        return;
    function select(key) {
        let visible = 0;
        for (const card of cards) {
            const match = key === 'all' || card.dataset.category === key;
            card.hidden = !match;
            if (match)
                visible++
        }
        buttons.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.filter === key)));
        result.textContent = `Showing ${visible} of ${cards.length} recommendations`;
    }
    buttons.forEach(b => b.addEventListener('click', () => select(b.dataset.filter)));
    select('all');
    const hash = decodeURIComponent(location.hash.slice(1));
    if (hash && document.getElementById(hash)) {
        const target = document.getElementById(hash);
        const category = target.dataset.category;
        if (category)
            select(category)
    }
}
)();
