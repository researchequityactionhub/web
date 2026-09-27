/* =========================================================
   Recommendation filter (used on fair.html)
   ========================================================= */
(() => {
    const buttons = [...document.querySelectorAll('[data-filter]')];
    const cards = [...document.querySelectorAll('[data-category]')];
    const result = document.querySelector('#results-count');

    if (!buttons.length || !result) return;

    function select(key) {
        let visible = 0;
        for (const card of cards) {
            const match = key === 'all' || card.dataset.category === key;
            card.hidden = !match;
            if (match) visible++;
        }
        buttons.forEach(b =>
            b.setAttribute('aria-pressed', String(b.dataset.filter === key))
        );
        result.textContent = `Showing ${visible} of ${cards.length} recommendations`;
    }

    buttons.forEach(b =>
        b.addEventListener('click', () => select(b.dataset.filter))
    );

    select('all');

    const hash = decodeURIComponent(location.hash.slice(1));
    if (hash && document.getElementById(hash)) {
        const target = document.getElementById(hash);
        const category = target.dataset.category;
        if (category) select(category);
    }
})();

/* =========================================================
   Contact form validation + Web3Forms submission (used on index.html)
   ========================================================= */
(() => {
    const form = document.getElementById('contact-form');
    if (!form) return;

    const status = document.getElementById('form-status');
    const submitBtn = form.querySelector('#submit-btn');
    const btnLabel = submitBtn.querySelector('.btn-label');
    const btnSpinner = submitBtn.querySelector('.btn-spinner');

    const validators = {
        name: v => v.trim().length >= 2,
        email: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
        purpose: v => v !== '',
        message: v => v.trim().length >= 10,
        consent: (_, el) => el.checked
    };

    function showError(fieldName, show) {
        const err = document.getElementById('err-' + fieldName);
        if (err) err.hidden = !show;
        const input = form.querySelector('[name="' + fieldName + '"]');
        if (input) input.setAttribute('aria-invalid', show ? 'true' : 'false');
    }

    function validateField(name) {
        const input = form.querySelector('[name="' + name + '"]');
        if (!input) return true;
        const ok = validators[name]
            ? validators[name](input.value, input)
            : true;
        showError(name, !ok);
        return ok;
    }

    // Live validation on blur; clear error once the user fixes it
    Object.keys(validators).forEach(name => {
        const input = form.querySelector('[name="' + name + '"]');
        if (!input) return;
        input.addEventListener('blur', () => validateField(name));
        input.addEventListener('input', () => {
            if (input.getAttribute('aria-invalid') === 'true') validateField(name);
        });
        input.addEventListener('change', () => {
            if (input.getAttribute('aria-invalid') === 'true') validateField(name);
        });
    });

    form.addEventListener('submit', async e => {
        e.preventDefault();

        const allOk = Object.keys(validators).every(validateField);
        if (!allOk) {
            status.textContent =
                'Please fix the highlighted fields before sending.';
            status.className = 'form-status is-error';
            const firstBad = form.querySelector('[aria-invalid="true"]');
            if (firstBad) firstBad.focus();
            return;
        }

        submitBtn.disabled = true;
        btnLabel.textContent = 'Sending…';
        btnSpinner.hidden = false;
        status.textContent = '';
        status.className = 'form-status';

        try {
            const data = new FormData(form);
            const res = await fetch(form.action, {
                method: 'POST',
                body: data,
                headers: { Accept: 'application/json' }
            });
            const json = await res.json();

            if (res.ok && json.success) {
                form.reset();
                status.textContent =
                    'Thank you — your enquiry has been sent. A reply will follow shortly.';
                status.className = 'form-status is-success';
            } else {
                throw new Error(json.message || 'Submission failed');
            }
        } catch (err) {
            status.textContent =
                'Sorry, something went wrong. Please try again or email directly.';
            status.className = 'form-status is-error';
        } finally {
            submitBtn.disabled = false;
            btnLabel.textContent = 'Send enquiry';
            btnSpinner.hidden = true;
        }
    });
})();
