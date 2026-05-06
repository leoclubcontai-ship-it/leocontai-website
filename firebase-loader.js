// ═══════════════════════════════════════════════════════
//  LEO CLUB OF CONTAI — Firebase Live Data Loader
//  Included on all public pages to load real data
//  from Firebase Firestore into the page
// ═══════════════════════════════════════════════════════

(async function() {
  // Only run if Firebase config is available
  if (!window.FIREBASE_CONFIG) return;

  const FB_VERSION = "10.12.0";
  const BASE = `https://www.gstatic.com/firebasejs/${FB_VERSION}`;

  // Dynamic import Firebase modules
  const [
    { initializeApp },
    { getFirestore, doc, getDoc, collection, getDocs, query, orderBy }
  ] = await Promise.all([
    import(`${BASE}/firebase-app.js`),
    import(`${BASE}/firebase-firestore.js`)
  ]);

  const app = initializeApp(window.FIREBASE_CONFIG, 'public-loader-' + Math.random());
  const db  = getFirestore(app);

  // ── HELPER ──
  const fmtDate = d => {
    if(!d) return '';
    try { return new Date(d+'T00:00:00').toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'}); }
    catch { return d; }
  };

  // ── LOAD SETTINGS AND APPLY TO PAGE ──
  try {
    // Contact info — update all phone numbers, addresses, emails on the page
    const contactSnap = await getDoc(doc(db, 'settings', 'contact'));
    if (contactSnap.exists()) {
      const ci = contactSnap.data();
      // Apply to any element with data-ci attribute
      document.querySelectorAll('[data-ci]').forEach(el => {
        const key = el.dataset.ci;
        if (ci[key] !== undefined) el.textContent = ci[key];
      });
      // Update footer contact rows
      if (ci['ci-addr']) document.querySelectorAll('.footer-address').forEach(el => el.textContent = ci['ci-addr']);
      if (ci['ci-ph'])   document.querySelectorAll('.footer-phone').forEach(el => el.textContent = ci['ci-ph']);
      if (ci['ci-email']) document.querySelectorAll('.footer-email').forEach(el => el.textContent = ci['ci-email']);
      if (ci['ci-fb']) document.querySelectorAll('a.footer-fb').forEach(el => el.href = ci['ci-fb']);
    }
  } catch(e) {}

  // ── HERO SETTINGS (index.html) ──
  try {
    const heroSnap = await getDoc(doc(db, 'settings', 'hero'));
    if (heroSnap.exists()) {
      const h = heroSnap.data();
      // Hero stats
      const statNums   = document.querySelectorAll('.hs-n, .wh-stat .n, .imp-n, .sb-n');
      const statLabels = document.querySelectorAll('.hs-l, .wh-stat .l, .imp-l, .sb-l');
      // Only update if elements have data-stat attribute
      document.querySelectorAll('[data-stat-n]').forEach(el => { const k=el.dataset.statN; if(h[k]) el.textContent=h[k]; });
      document.querySelectorAll('[data-stat-l]').forEach(el => { const k=el.dataset.statL; if(h[k]) el.textContent=h[k]; });
    }
  } catch(e) {}

  // ── PROJECT PAGES — Load from Firebase ──
  // project-blood.html, project-environment.html, etc.
  const pageCat = window.PAGE_CONFIG?.cat;
  if (pageCat && document.getElementById('projectGrid')) {
    try {
      const snap = await getDocs(query(collection(db, 'projects'), orderBy('createdAt', 'desc')));
      const filtered = snap.docs.filter(d => d.data().cat === pageCat);

      if (filtered.length > 0) {
        const CAT_INFO_MAP = {
          blood:       {label:'Blood Donation',  emoji:'🩸', col:'rgba(231,76,60,.85)'},
          environment: {label:'Environment',     emoji:'🌿', col:'rgba(39,174,96,.85)'},
          education:   {label:'Education',       emoji:'📚', col:'rgba(59,130,246,.85)'},
          sports:      {label:'Youth Sports',    emoji:'⚽', col:'rgba(245,158,11,.85)'},
          donation:    {label:'Donation Drives', emoji:'🤲', col:'rgba(139,92,246,.85)'},
          community:   {label:'Community',       emoji:'🤝', col:'rgba(6,182,212,.85)'},
        };

        const ci = CAT_INFO_MAP[pageCat] || {label:'Projects',emoji:'📁',col:'rgba(100,100,100,.85)'};
        const ini = n => (n||'').split(' ').filter(Boolean).slice(0,2).map(w=>w[0]).join('').toUpperCase()||'?';

        const grid = document.getElementById('projectGrid');

        // Build Firebase-loaded cards
        const firebaseCards = filtered.map((d, i) => {
          const p = d.data();
          return `<div class="pcard rv d${(i%5)+1}" onclick="openLb_fb('${d.id}')">
            <div class="pcard-img">
              ${p.imageUrl ? `<img src="${p.imageUrl}" alt="${p.title}" loading="lazy" onerror="this.onerror=null;this.style.display='none'">` : ''}
              <div class="pcard-img-placeholder" style="${p.imageUrl?'display:none':''}">
                ${ci.emoji}
              </div>
              <div class="pcard-overlay"></div>
              ${p.badge ? `<div class="pcard-badge">${p.badge}</div>` : ''}
              <div class="pcard-date">${fmtDate(p.date)}</div>
            </div>
            <div class="pcard-body">
              <div class="pcard-cat">${ci.emoji} ${ci.label}</div>
              <h3>${p.title||''}</h3>
              <p>${p.description||p.desc||''}</p>
            </div>
            <div class="pcard-meta">
              <div class="pcard-author">
                <div class="pcard-avatar">${ini(p.member||'Leo')}</div>
                <span class="pcard-author-name">${p.member||'Leo Member'}</span>
              </div>
            </div>
          </div>`;
        }).join('');

        // Replace grid content with Firebase data
        grid.innerHTML = firebaseCards;

        // Update count in header
        document.querySelectorAll('#phCount, #projCountBadge').forEach(el => {
          if(el.id==='phCount') el.textContent = filtered.length;
          if(el.id==='projCountBadge') el.textContent = filtered.length + ' Project' + (filtered.length!==1?'s':'');
        });
        document.querySelectorAll('#statsTotal').forEach(el => el.textContent = filtered.length);

        // Store data for lightbox
        window._fbProjects = {};
        filtered.forEach(d => window._fbProjects[d.id] = d.data());

        // Override lightbox open function
        window.openLb_fb = function(id) {
          const p = window._fbProjects[id];
          if(!p) return;
          const ci2 = CAT_INFO_MAP[pageCat]||{emoji:'📁',label:'Project'};
          const lb = document.getElementById('lightbox');
          const imgWrap = document.getElementById('lbImgWrap');
          if(!lb || !imgWrap) return;
          imgWrap.innerHTML = p.imageUrl
            ? `<img src="${p.imageUrl}" alt="${p.title}" style="width:100%;height:100%;object-fit:cover">`
            : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:80px;background:linear-gradient(135deg,#0B1730,#1C2E54)">${ci2.emoji}</div>`;
          const badge = document.getElementById('lbBadge');
          const title = document.getElementById('lbTitle');
          const desc  = document.getElementById('lbDesc');
          const date  = document.getElementById('lbDate');
          const mem   = document.getElementById('lbMember');
          if(badge) badge.textContent = p.badge||ci2.label;
          if(title) title.textContent = p.title||'';
          if(desc)  desc.textContent  = p.description||p.desc||'';
          if(date)  date.textContent  = fmtDate(p.date);
          if(mem)   mem.textContent   = p.member||'Leo Member';
          lb.classList.add('open');
          document.body.style.overflow='hidden';
        };

        // Also hook existing click handlers
        document.querySelectorAll('.pcard').forEach((card, i) => {
          const id = filtered[i]?.id;
          if(id) card.onclick = () => window.openLb_fb(id);
        });

        // Re-observe for reveal animations
        if(window.__revealObs) {
          document.querySelectorAll('.pcard').forEach(el => window.__revealObs.observe(el));
        }
      }
    } catch(e) { console.log('Firebase project load error:', e); }
  }

  // ── TEAM PAGE — Load member photos from Firebase ──
  if (document.querySelector('.lc, .mc')) {
    try {
      const snap = await getDocs(collection(db, 'members'));
      snap.docs.forEach(d => {
        const m = d.data();
        if (!m.photoUrl) return;
        // Try to match leader cards by name
        document.querySelectorAll('.lc').forEach(card => {
          const nameEl = card.querySelector('h3');
          if (!nameEl) return;
          const cardName = nameEl.textContent.toLowerCase().replace('leo ','').trim();
          const memName  = (m.name||'').toLowerCase().replace('leo ','').trim();
          if (memName.includes(cardName.split(' ')[0]) || cardName.includes(memName.split(' ')[0])) {
            const imgWrap = card.querySelector('.lc-img');
            if (imgWrap && m.photoUrl) {
              const rank = imgWrap.querySelector('.lc-rank');
              imgWrap.style.overflow = 'hidden';
              const img = document.createElement('img');
              img.src = m.photoUrl;
              img.alt = m.name;
              img.style.cssText = 'width:100%;height:100%;object-fit:cover;object-position:top';
              img.onerror = () => img.remove();
              imgWrap.insertBefore(img, imgWrap.firstChild);
              if (rank) imgWrap.appendChild(rank);
            }
          }
        });
      });
    } catch(e) {}
  }

  // ── GALLERY PAGE — Load photos from Firebase ──
  const galGrid = document.getElementById('galleryMasonry');
  if (galGrid) {
    try {
      const snap = await getDocs(query(collection(db, 'gallery'), orderBy('createdAt', 'desc')));
      if (snap.size > 0) {
        const newItems = snap.docs.map(d => {
          const v = d.data();
          return `<div class="gallery-item rv" data-cat="${v.cat||'events'}">
            <img src="${v.url}" alt="${v.title||''}" loading="lazy" onerror="this.onerror=null;this.style.background='linear-gradient(135deg,#0B1730,#1C2E54)'">
            <div class="gi-overlay">
              <div class="gi-label"><span>${v.cat||'Events'}</span>${v.title||''}</div>
            </div>
          </div>`;
        }).join('');
        // Append Firebase photos after existing ones
        galGrid.insertAdjacentHTML('afterbegin', newItems);
      }
    } catch(e) {}
  }

  // ── ANNOUNCEMENTS on index.html ──
  // Already handled via localStorage fallback; Firebase version loads fresh data
  window._firebaseLoaded = true;

})();
