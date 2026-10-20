
document.addEventListener('DOMContentLoaded', () => {
  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => [...root.querySelectorAll(s)];

  // Responsive navigation
  const menu = $('#menuToggle');
  const nav = $('#mainNav');
  if (menu && nav) {
    menu.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      menu.setAttribute('aria-expanded', String(open));
      menu.textContent = open ? '×' : '☰';
    });
    $$('a', nav).forEach(a => a.addEventListener('click', () => {
      nav.classList.remove('open');
      menu.setAttribute('aria-expanded', 'false');
      menu.textContent = '☰';
    }));
  }

  // Footer year and live clock ticker
  $$('[data-year]').forEach(el => el.textContent = new Date().getFullYear());
  const ticker = $('#tickerText');
  const updateClock = () => {
    if (!ticker) return;
    const now = new Date();
    const date = now.toLocaleDateString(undefined, {weekday:'short', year:'numeric', month:'short', day:'numeric'});
    const time = now.toLocaleTimeString(undefined, {hour:'2-digit', minute:'2-digit'});
    ticker.textContent = `⛰ YOUR NEXT SUMMIT STARTS HERE  •  ${date}  •  ${time}  •  PLAN SMART. CLIMB RESPONSIBLY.`;
  };
  updateClock();
  setInterval(updateClock, 60000);

  // Scroll progress and floating controls
  const progress = document.createElement('div');
  progress.id = 'readingProgress';
  document.body.appendChild(progress);
  const tools = document.createElement('div');
  tools.className = 'floating-tools';
  tools.innerHTML = '<button class="float-btn" id="glowToggle" aria-label="Toggle neon glow" title="Neon boost">✦</button><button class="float-btn" id="backTop" aria-label="Back to top" title="Back to top">↑</button>';
  document.body.appendChild(tools);
  const updateProgress = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = `${max > 0 ? (window.scrollY / max) * 100 : 0}%`;
    $('#backTop').style.opacity = window.scrollY > 320 ? '1' : '.5';
  };
  window.addEventListener('scroll', updateProgress, {passive:true});
  updateProgress();
  $('#backTop').addEventListener('click', () => window.scrollTo({top:0,behavior:'smooth'}));
  $('#glowToggle').addEventListener('click', () => {
    document.body.classList.toggle('glow-boost');
    const active = document.body.classList.contains('glow-boost');
    $('#glowToggle').textContent = active ? '✧' : '✦';
    $('#glowToggle').title = active ? 'Turn neon boost off' : 'Neon boost';
  });

  // Soft reveal as sections/cards enter view
  const revealTargets = $$('.hero-inner, .metrics, main .section-head, main .grid, main .callout, main .list-panel, main .form-card, main .table-wrap, main .prose, main .stat-band');
  revealTargets.forEach(el => el.classList.add('reveal'));
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, {threshold:0.08});
    revealTargets.forEach(el => observer.observe(el));
  } else revealTargets.forEach(el => el.classList.add('is-visible'));

  // Image lightbox for gallery cards
  const galleryImages = $$('.gallery .card img');
  if (galleryImages.length) {
    const box = document.createElement('div');
    box.className = 'lightbox';
    box.setAttribute('role','dialog');
    box.setAttribute('aria-modal','true');
    box.setAttribute('aria-label','Image preview');
    box.innerHTML = '<div><img alt=""><p></p></div><button type="button" aria-label="Close image preview">×</button>';
    document.body.appendChild(box);
    const close = () => box.classList.remove('open');
    $('button', box).addEventListener('click', close);
    box.addEventListener('click', e => { if (e.target === box) close(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
    galleryImages.forEach(img => {
      img.closest('.card').addEventListener('click', () => {
        $('img', box).src = img.src.replace(/w=900/, 'w=1600');
        $('img', box).alt = img.alt;
        $('p', box).textContent = img.alt;
        box.classList.add('open');
      });
    });
  }

  // Booking demo: friendly validation and explicit demo confirmation
  $$('form[data-demo-form]').forEach(form => {
    form.addEventListener('submit', e => {
      e.preventDefault();
      if (!form.reportValidity()) return;
      const notice = $('.notice', form);
      if (notice) {
        notice.textContent = '✓ Demo enquiry checked successfully! This student website does not send or store your details.';
        notice.setAttribute('role','status');
      }
      const submit = $('button[type="submit"]', form);
      if (submit) {
        const old = submit.textContent;
        submit.textContent = '✓ Demo validated';
        setTimeout(() => submit.textContent = old, 2600);
      }
    });
  });

  // Interactive package cost estimator on the packages page
  if (/packages\.html$/i.test(location.pathname)) {
    const main = $('main');
    const sectionHead = $$('.section-head', main).find(el => /compare packages/i.test(el.textContent));
    if (sectionHead) {
      const calc = document.createElement('section');
      calc.className = 'neon-calculator';
      calc.innerHTML = `
        <span class="mini-label">Interactive trip planner</span>
        <h3>Estimate your group budget</h3>
        <p style="color:var(--muted);margin-top:-5px">Try different packages and group sizes. These are sample project prices, not a real quote.</p>
        <div class="calc-row">
          <div class="field"><label for="calcPackage">Choose a package</label>
            <select id="calcPackage">
              <option value="25000">Basic Trek — PKR 25,000/person</option>
              <option value="65000">Adventure Climbing — PKR 65,000/person</option>
              <option value="185000">Himalayan Expedition — PKR 185,000/person</option>
            </select>
          </div>
          <div class="field"><label for="calcPeople">Number of people</label><input id="calcPeople" type="number" min="1" max="20" value="2"></div>
        </div>
        <div class="calc-result">Estimated group total <strong id="calcTotal">PKR 50,000</strong><div id="calcBreakdown" style="color:var(--muted);font-size:.9rem">2 people × PKR 25,000 per person</div></div>`;
      sectionHead.insertAdjacentElement('afterend', calc);
      const packageSelect = $('#calcPackage');
      const peopleInput = $('#calcPeople');
      const total = $('#calcTotal');
      const breakdown = $('#calcBreakdown');
      const format = n => 'PKR ' + Math.round(n).toLocaleString('en-PK');
      const calculate = () => {
        const price = Number(packageSelect.value);
        const people = Math.max(1, Math.min(20, Number(peopleInput.value) || 1));
        peopleInput.value = people;
        total.textContent = format(price * people);
        breakdown.textContent = `${people} ${people === 1 ? 'person' : 'people'} × ${format(price)} per person`;
      };
      packageSelect.addEventListener('change', calculate);
      peopleInput.addEventListener('input', calculate);
    }
  }

  // Make cards keyboard-friendly when their contents include links or images
  $$('.gallery .card').forEach(card => {
    card.setAttribute('tabindex','0');
    card.setAttribute('aria-label','Open image preview');
    card.addEventListener('keydown', e => {
      if ((e.key === 'Enter' || e.key === ' ') && $('img', card)) {
        e.preventDefault();
        $('img', card).click();
      }
    });
  });
});
