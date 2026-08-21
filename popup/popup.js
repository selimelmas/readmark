/**
 * Readmark - High-Performance Popup Controller (with Tag Auto-Suggest & Search Bar Listing)
 */
document.addEventListener('DOMContentLoaded', async () => {
  let items = [], currentFilter = 'all', searchQuery = '', settings = {}, sortMode = 'newest', dragSrcId = null;

  const $ = id => document.getElementById(id), setIcon = (id, svg) => { const el = $(id); if (el && svg) el.innerHTML = svg; };
  const t = (k, fb) => typeof I18n !== 'undefined' ? I18n.t(k, fb) : fb;
  const esc = s => String(s || '').replace(/[&<>"']/g, m => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m]));

  const SORT_ICONS = { newest: 'sortDesc', oldest: 'sortAsc', az: 'sortAZ' }, SORT_MODES = ['newest', 'oldest', 'az'];

  const TIME_UNITS = {
    tr: ['az önce', ' dk', ' sa', ' gün'], en: ['just now', 'm', 'h', 'd'], de: ['gerade', 'min', 'h', 'T'], fr: ["à l'instant", 'min', 'h', 'j'],
    es: ['ahora', 'min', 'h', 'd'], it: ['adesso', 'min', 'h', 'g'], pt_BR: ['agora', 'min', 'h', 'd'], ru: ['только что', 'мин', 'ч', 'д'],
    zh_CN: ['刚刚', '分钟', '小时', '天'], zh_TW: ['剛剛', '分鐘', '小時', '天'], ja: ['たった今', '分', '時間', '日'], ko: ['방금', '분', '시간', '일'],
    ar: ['الآن', 'د', 'س', 'ي'], hi: ['अभी', 'मि', 'घं', 'दि'], nl: ['nu', 'min', 'u', 'd'], pl: ['przed chwilą', 'min', 'g', 'd'],
    uk: ['щойно', 'хв', 'год', 'д'], sv: ['nyss', 'min', 'tim', 'd'], id: ['baru saja', 'mnt', 'jam', 'hr'], vi: ['vừa xong', 'ph', 'g', 'ng']
  };

  ['brandLogo:logo', 'btnSearchToggle:search', 'btnSort:sortDesc', 'btnAddCurrent:plus', 'btnOpenOptions:settings', 'searchIcon:search', 'btnClearSearch:close', 'emptyIcon:bookmark'].forEach(p => {
    const [id, k] = p.split(':'); setIcon(id, Icons[k]);
  });

  const filterChips = document.querySelectorAll('.filter-chip'), toast = $('toast'), list = $('itemsList');
  let toastTimer, searchDebounce, singleClickTimer, confirmCallback = null;

  const showToast = msg => {
    if (!toast) return;
    toast.textContent = msg; toast.classList.remove('hidden');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.add('hidden'), 1800);
  };

  const showConfirm = (text, onOk) => {
    if ($('confirmText')) $('confirmText').textContent = text;
    if ($('btnConfirmCancel')) $('btnConfirmCancel').textContent = t('cancel', 'İptal');
    if ($('btnConfirmOk')) $('btnConfirmOk').textContent = t('confirm', 'Onayla');
    confirmCallback = onOk; $('confirmDialog')?.classList.remove('hidden');
  };
  const closeConfirm = () => { $('confirmDialog')?.classList.add('hidden'); confirmCallback = null; };
  $('btnConfirmCancel')?.addEventListener('click', closeConfirm);
  $('btnConfirmOk')?.addEventListener('click', async () => { if (confirmCallback) { const cb = confirmCallback; closeConfirm(); await cb(); } });

  const getAllTags = () => {
    const set = new Set();
    items.forEach(i => (i.tags || []).forEach(tg => set.add(tg)));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  };

  const updateBtn = (li, sel, base, act, on, offI, onI, offL, onL) => {
    const btn = li.querySelector(sel); if (!btn) return;
    const active = on(); btn.className = active ? `${base} ${act}` : base; btn.innerHTML = active ? onI : offI;
    const lbl = active ? onL : offL; btn.title = lbl; btn.setAttribute('aria-label', lbl);
  };

  function updateSearchTagsBar() {
    const bar = $('searchTagsBar'), dl = $('allTagsDatalist');
    const allTags = getAllTags();
    if (dl) dl.innerHTML = allTags.map(tg => `<option value="${esc(tg)}"></option><option value="#${esc(tg)}"></option>`).join('');
    if (!bar) return;
    if (!allTags.length) { bar.classList.add('hidden'); return; }
    bar.classList.remove('hidden');
    const cleanQ = searchQuery.replace(/^#/, '').toLowerCase();
    bar.innerHTML = allTags.map(tg => {
      const isActive = cleanQ === tg.toLowerCase();
      return `<button class="search-tag-chip ${isActive ? 'active' : ''}" data-tag="${esc(tg)}">#${esc(tg)}</button>`;
    }).join('');
  }

  function updateBadgesAndStats() {
    let unread = 0, starred = 0;
    for (let i = 0; i < items.length; i++) { if (!items[i].isRead) unread++; if (items[i].isPinned) starred++; }
    const read = items.length - unread;
    [['badgeAll', items.length], ['badgeUnread', unread], ['badgeRead', read], ['badgeStarred', starred]].forEach(([id, val]) => $(id) && ($(id).textContent = val));
    if ($('footerStats')) $('footerStats').textContent = `${items.length} ${t('totalItems', 'Toplam Öğe')} · ${unread} ${t('unreadCount', 'Okunmamış')}`;
    $('btnMarkAllRead')?.classList.toggle('hidden', unread === 0);
    $('btnClearCompleted')?.classList.toggle('hidden', read === 0);
  }

  function updateCardDOM(li, it) {
    if (!li || !it) return;
    li.className = `item-card ${it.isRead ? 'is-read' : ''} ${it.isPinned ? 'is-pinned' : ''}`;
    updateBtn(li, '.action-btn.check', 'action-btn check', 'checked', () => it.isRead, Icons.circle, Icons.checkCircle, t('markAsRead','Okundu'), t('markAsUnread','Okunmadı'));
    updateBtn(li, '.action-btn.star', 'action-btn star', 'starred', () => it.isPinned, Icons.heart, Icons.heartFilled, t('favorite','Favorilere ekle'), t('unfavorite','Favorilerden kaldır'));
    updateBadgesAndStats();
    if ((currentFilter === 'unread' && it.isRead) || (currentFilter === 'read' && !it.isRead) || (currentFilter === 'starred' && !it.isPinned)) removeCardWithAnimation(li);
  }

  function removeCardWithAnimation(li) {
    if (!li) return;
    li.classList.add('removing');
    setTimeout(() => { li.remove(); if (!list?.querySelector('.item-card')) renderList(); }, 200);
    updateBadgesAndStats();
  }

  function editTitle(it, li) {
    const titleEl = li.querySelector('.item-title'); if (!titleEl || titleEl.tagName === 'INPUT') return;
    const cur = it.title || '', input = document.createElement('input');
    input.type = 'text'; input.className = 'item-title-input'; input.value = cur;
    titleEl.replaceWith(input); input.focus(); input.select();

    let committed = false;
    const commit = async val => {
      if (committed) return; committed = true;
      const next = (val || '').trim() || cur, div = document.createElement('div');
      div.className = 'item-title'; div.textContent = next;
      input.replaceWith(div);
      if (next !== cur) { items = await Storage.updateItemTitle(it.id, next); it.title = next; showToast(t('titleSaved', 'Başlık kaydedildi')); }
    };
    input.addEventListener('blur', () => commit(input.value));
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') { e.preventDefault(); input.blur(); }
      if (e.key === 'Escape') { committed = true; const d = document.createElement('div'); d.className = 'item-title'; d.textContent = cur; input.replaceWith(d); }
    });
  }

  function addTagInput(it, li, container) {
    const addBtn = container.querySelector('.btn-add-tag'); if (!addBtn) return;
    const input = document.createElement('input');
    input.type = 'text'; input.className = 'tag-input-inline'; input.placeholder = t('tagPlaceholder', 'etiket...');
    input.setAttribute('list', 'allTagsDatalist');
    addBtn.replaceWith(input); input.focus();

    let committed = false;
    const commitTag = async val => {
      if (committed) return; committed = true;
      const raw = (val || '').trim().replace(/^#/, '');
      if (raw) {
        const curTags = it.tags || [], newTags = curTags.includes(raw) ? curTags : [...curTags, raw];
        if (newTags.length !== curTags.length) {
          items = await Storage.updateItemTags(it.id, newTags); it.tags = newTags;
          showToast(t('tagSaved', 'Etiket eklendi'));
        }
      }
      renderList();
    };
    input.addEventListener('blur', () => commitTag(input.value));
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); commitTag(input.value); }
      if (e.key === 'Escape') { committed = true; renderList(); }
    });
  }

  async function openItem(item, inBackground) {
    if (settings.autoMarkReadOnOpen && !item.isRead) {
      items = await Storage.toggleRead(item.id);
      const li = list?.querySelector(`[data-id="${item.id}"]`);
      if (li) updateCardDOM(li, items.find(i => i.id === item.id)); else updateBadgesAndStats();
    }
    chrome.tabs?.create ? chrome.tabs.create({ url: item.url, active: !inBackground }) : window.open(item.url, '_blank');
  }

  function renderList() {
    if (!list) return;
    const cleanQ = searchQuery.replace(/^#/, '').toLowerCase();
    let filtered = items.filter(i => {
      if ((currentFilter === 'unread' && i.isRead) || (currentFilter === 'read' && !i.isRead) || (currentFilter === 'starred' && !i.isPinned)) return false;
      if (!searchQuery) return true;
      return (i.title || '').toLowerCase().includes(searchQuery) || (i.url || '').toLowerCase().includes(searchQuery) || (i.tags || []).some(tg => tg.toLowerCase().includes(cleanQ));
    });

    if (sortMode === 'oldest') filtered.sort((a, b) => (a.addedAt || 0) - (b.addedAt || 0));
    else if (sortMode === 'az') filtered.sort((a, b) => (a.title || '').localeCompare(b.title || ''));

    updateBadgesAndStats();
    updateSearchTagsBar();

    if (filtered.length === 0) {
      list.innerHTML = '';
      const empty = $('emptyState'); empty?.classList.remove('hidden');
      if (empty) {
        empty.querySelector('.empty-title').textContent = searchQuery ? t('emptySearch', 'Aramanızla eşleşen kayıt bulunamadı.') : t('emptyTitle', 'Okuma listeniz henüz boş');
        empty.querySelector('.empty-subtitle').textContent = searchQuery ? '' : t('emptySubtitle', 'Yukarıdaki butona tıklayarak geçerli sekmeyi listenize ekleyin.');
      }
      return;
    }

    $('emptyState')?.classList.add('hidden');
    const u = TIME_UNITS[I18n?.currentLang] || TIME_UNITS.en, now = Date.now();
    const frag = document.createDocumentFragment();

    for (let idx = 0; idx < filtered.length; idx++) {
      const it = filtered[idx];
      const li = document.createElement('li');
      li.className = `item-card ${it.isRead ? 'is-read' : ''} ${it.isPinned ? 'is-pinned' : ''}`;
      li.dataset.id = it.id; li.tabIndex = 0; li.draggable = true;
      li.setAttribute('role', 'article'); li.setAttribute('aria-label', it.title || it.url);

      let domain = it.url; try { domain = new URL(it.url).hostname.replace(/^www\./, ''); } catch {}
      const diff = Math.floor((now - (it.addedAt || now)) / 1000);
      const timeStr = diff < 60 ? u[0] : diff < 3600 ? `${Math.floor(diff/60)}${u[1]}` : diff < 86400 ? `${Math.floor(diff/3600)}${u[2]}` : `${Math.floor(diff/86400)}${u[3]}`;
      const tagList = it.tags || [];

      li.innerHTML = `
        <div class="item-favicon-wrap">
          ${it.favIconUrl ? `<img src="${esc(it.favIconUrl)}" class="item-favicon" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';" alt="" />` : ''}
          <span class="item-favicon-fallback" style="${it.favIconUrl ? 'display:none;' : ''}">${domain.charAt(0).toUpperCase()}</span>
        </div>
        <div class="item-content" title="${esc(it.title || it.url)}">
          <div class="item-title">${esc(it.title || it.url)}</div>
          <div class="item-meta">
            <span class="item-domain">${esc(domain)}</span><span class="item-dot">•</span><span class="item-time">${timeStr}</span>
            ${it.readingTime ? `<span class="item-dot">•</span><span class="item-reading-time" title="${t('minRead', '{n} dk okuma').replace('{n}', it.readingTime)}">~${it.readingTime} ${t('minUnit', 'dk')}</span>` : ''}
          </div>
          <div class="item-tags">
            ${tagList.map(tg => `<span class="item-tag" data-tag="${esc(tg)}">#${esc(tg)}<span class="tag-del" data-action="del-tag" data-tag="${esc(tg)}" title="${t('removeTag','Kaldır')}">×</span></span>`).join('')}
            <button class="btn-add-tag" data-action="add-tag" title="${t('addTag','Etiket ekle')}">+</button>
          </div>
        </div>
        <div class="item-actions">
          <button class="action-btn check ${it.isRead ? 'checked' : ''}" data-action="read" title="${it.isRead ? t('markAsUnread','Okunmadı') : t('markAsRead','Okundu')}" aria-label="${it.isRead ? t('markAsUnread','Okunmadı') : t('markAsRead','Okundu')}">${it.isRead ? Icons.checkCircle : Icons.circle}</button>
          <button class="action-btn star ${it.isPinned ? 'starred' : ''}" data-action="pin" title="${it.isPinned ? t('unfavorite','Favorilerden kaldır') : t('favorite','Favorilere ekle')}" aria-label="${it.isPinned ? t('unfavorite','Favorilerden kaldır') : t('favorite','Favorilere ekle')}">${it.isPinned ? Icons.heartFilled : Icons.heart}</button>
          <button class="action-btn open" data-action="open" title="${t('openTab','Aç')}" aria-label="${t('openTab','Aç')}">${Icons.externalLink}</button>
          <button class="action-btn delete" data-action="del" title="${t('delete','Sil')}" aria-label="${t('delete','Sil')}">${Icons.trash}</button>
        </div>`;

      frag.appendChild(li);
    }

    list.innerHTML = '';
    list.appendChild(frag);
  }

  // Delegated Event Listeners on List Container
  list?.addEventListener('click', async e => {
    const actBtn = e.target.closest('button[data-action]'), li = e.target.closest('.item-card');
    if (!li) return;
    const it = items.find(i => i.id === li.dataset.id);
    if (!it) return;

    // Tag removal
    const tagDelBtn = e.target.closest('[data-action="del-tag"]');
    if (tagDelBtn) {
      e.stopPropagation();
      const tg = tagDelBtn.dataset.tag;
      const newTags = (it.tags || []).filter(x => x !== tg);
      items = await Storage.updateItemTags(it.id, newTags); it.tags = newTags; renderList();
      return;
    }

    // Add tag button click
    const addTagBtn = e.target.closest('[data-action="add-tag"]');
    if (addTagBtn) {
      e.stopPropagation();
      addTagInput(it, li, e.target.closest('.item-tags'));
      return;
    }

    // Tag click -> instant filter
    const tagSpan = e.target.closest('.item-tag');
    if (tagSpan) {
      e.stopPropagation();
      const tg = tagSpan.dataset.tag;
      toggleSearch(true);
      if ($('searchInput')) $('searchInput').value = '#' + tg;
      searchQuery = '#' + tg.toLowerCase();
      $('btnClearSearch')?.classList.remove('hidden');
      renderList();
      return;
    }

    if (actBtn) {
      e.stopPropagation();
      const act = actBtn.dataset.action;
      if (act === 'read') { items = await Storage.toggleRead(it.id); updateCardDOM(li, items.find(i => i.id === it.id)); }
      else if (act === 'pin') {
        items = await Storage.togglePin(it.id);
        const upd = items.find(i => i.id === it.id);
        updateCardDOM(li, upd);
        if (upd?.isPinned) { const h = li.querySelector('.action-btn.star'); if (h) { h.classList.add('heart-pop'); setTimeout(() => h.classList.remove('heart-pop'), 250); } }
      }
      else if (act === 'open') openItem(it, true);
      else if (act === 'del') showConfirm(t('deleteConfirm', 'Bu öğeyi silmek istediğinize emin misiniz?'), async () => { items = await Storage.deleteItem(it.id); removeCardWithAnimation(li); });
      return;
    }

    if (e.target.closest('.item-content') && e.target.tagName !== 'INPUT') {
      clearTimeout(singleClickTimer);
      if (e.detail > 1) return;
      singleClickTimer = setTimeout(() => openItem(it, false), 220);
    }
  });

  list?.addEventListener('dblclick', e => {
    const titleEl = e.target.closest('.item-title'), li = e.target.closest('.item-card');
    if (titleEl && li) {
      e.stopPropagation(); clearTimeout(singleClickTimer);
      const it = items.find(i => i.id === li.dataset.id);
      if (it) editTitle(it, li);
    }
  });

  // Delegated Drag & Drop
  list?.addEventListener('dragstart', e => {
    const li = e.target.closest('.item-card'); if (!li) return;
    dragSrcId = li.dataset.id; li.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', dragSrcId);
  });
  list?.addEventListener('dragend', e => { e.target.closest('.item-card')?.classList.remove('dragging'); dragSrcId = null; });
  list?.addEventListener('dragover', e => { const li = e.target.closest('.item-card'); if (li) { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; li.classList.add('drag-over'); } });
  list?.addEventListener('dragleave', e => { const li = e.target.closest('.item-card'); if (li && !li.contains(e.relatedTarget)) li.classList.remove('drag-over'); });
  list?.addEventListener('drop', async e => {
    const li = e.target.closest('.item-card'); if (!li) return;
    e.preventDefault(); li.classList.remove('drag-over');
    if (!dragSrcId || dragSrcId === li.dataset.id) return;
    const srcIdx = items.findIndex(i => i.id === dragSrcId), tgtIdx = items.findIndex(i => i.id === li.dataset.id);
    if (srcIdx === -1 || tgtIdx === -1) return;
    const reordered = [...items], [moved] = reordered.splice(srcIdx, 1);
    reordered.splice(tgtIdx, 0, moved); items = await Storage.saveItems(reordered); renderList();
  });

  async function loadAndRender() { items = await Storage.getItems(); renderList(); }

  const toggleSearch = show => {
    const bar = $('searchBar'); if (!bar) return;
    const open = show !== undefined ? show : bar.classList.contains('hidden');
    bar.classList.toggle('hidden', !open);
    if (open) { updateSearchTagsBar(); $('searchInput')?.focus(); }
    else { if ($('searchInput')) $('searchInput').value = ''; searchQuery = ''; $('btnClearSearch')?.classList.add('hidden'); renderList(); }
  };

  $('btnSearchToggle')?.addEventListener('click', () => toggleSearch());
  $('btnClearSearch')?.addEventListener('click', () => { if ($('searchInput')) $('searchInput').value = ''; searchQuery = ''; $('btnClearSearch')?.classList.add('hidden'); $('searchInput')?.focus(); renderList(); });
  $('searchInput')?.addEventListener('input', e => {
    searchQuery = e.target.value.trim().toLowerCase(); $('btnClearSearch')?.classList.toggle('hidden', !searchQuery);
    clearTimeout(searchDebounce); searchDebounce = setTimeout(renderList, 80);
  });
  $('searchInput')?.addEventListener('keydown', e => e.key === 'Escape' && toggleSearch(false));

  // Search tag chips click
  $('searchTagsBar')?.addEventListener('click', e => {
    const chip = e.target.closest('.search-tag-chip');
    if (!chip) return;
    const tg = chip.dataset.tag;
    const isCur = searchQuery.replace(/^#/, '').toLowerCase() === tg.toLowerCase();
    const nextQ = isCur ? '' : '#' + tg;
    if ($('searchInput')) $('searchInput').value = nextQ;
    searchQuery = nextQ.toLowerCase();
    $('btnClearSearch')?.classList.toggle('hidden', !searchQuery);
    renderList();
  });

  $('btnSort')?.addEventListener('click', () => {
    sortMode = SORT_MODES[(SORT_MODES.indexOf(sortMode) + 1) % SORT_MODES.length];
    const btn = $('btnSort'); setIcon('btnSort', Icons[SORT_ICONS[sortMode]]);
    btn.title = t(`sort${sortMode.charAt(0).toUpperCase() + sortMode.slice(1)}`, sortMode);
    btn.classList.toggle('sort-active', sortMode !== 'newest'); renderList();
  });

  filterChips.forEach(chip => chip.addEventListener('click', () => {
    filterChips.forEach(c => c.classList.remove('active')); chip.classList.add('active');
    currentFilter = chip.getAttribute('data-filter') || 'all'; Storage.setLastFilter(currentFilter); renderList();
  }));

  $('btnAddCurrent')?.addEventListener('click', async () => {
    const [tab] = (chrome.tabs?.query ? await chrome.tabs.query({ active: true, currentWindow: true }) : []) || [];
    if (!tab?.url) return;
    let readingTime = null;
    try {
      if (tab.id && chrome.scripting?.executeScript && !Storage.isRestrictedUrl(tab.url)) {
        const [res] = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => {
            const root = document.querySelector('article, main, [role="main"], .post-content, .article-content, #content') || document.body;
            const w = (root?.innerText || '').trim().split(/\s+/).filter(Boolean).length; return w >= 60 ? Math.ceil(w / 200) : null;
          }
        });
        if (res?.result) readingTime = res.result;
      }
    } catch {}
    const res = await Storage.addItem({ url: tab.url, title: tab.title || tab.url, favIconUrl: tab.favIconUrl, readingTime });
    if (res.isRestricted) showToast(t('restrictedUrlError', 'Sistem ve tarayıcı sayfaları okuma listesine eklenemez.'));
    else if (res.alreadyExists) showToast(t('alreadyAdded', 'Bu sayfa zaten okuma listenizde!'));
    else if (res.success) { showToast(t('addedSuccess', 'Okuma listesine eklendi')); await loadAndRender(); }
  });

  $('btnOpenOptions')?.addEventListener('click', () => chrome.runtime?.openOptionsPage ? chrome.runtime.openOptionsPage() : window.open('../options/options.html', '_blank'));
  $('btnMarkAllRead')?.addEventListener('click', () => showConfirm(t('markAllRead', 'Hepsini okundu işaretle?'), async () => { items = await Storage.markAllRead(); renderList(); }));
  $('btnClearCompleted')?.addEventListener('click', () => showConfirm(t('clearConfirm', 'Okunmuş tüm öğeleri silmek istediğinize emin misiniz?'), async () => { items = await Storage.clearCompleted(); renderList(); }));

  document.addEventListener('keydown', async e => {
    const isSearch = document.activeElement === $('searchInput'), isModal = !$('confirmDialog')?.classList.contains('hidden');
    if (isModal) { if (e.key === 'Escape') { e.preventDefault(); closeConfirm(); } else if (e.key === 'Enter') { e.preventDefault(); $('btnConfirmOk')?.click(); } return; }
    if (document.activeElement?.tagName === 'INPUT' && (document.activeElement.className === 'item-title-input' || document.activeElement.className === 'tag-input-inline')) return;
    if (isSearch) { if (e.key === 'Escape' || e.key === 'ArrowDown') { e.preventDefault(); if (e.key === 'Escape') toggleSearch(false); list?.querySelector('.item-card')?.focus(); } return; }
    if (e.key === '/' || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f')) { e.preventDefault(); toggleSearch(true); return; }
    if (e.key === 'Escape') { toggleSearch(false); return; }
    if (['1','2','3','4'].includes(e.key) && !e.ctrlKey && !e.altKey && !e.metaKey) { e.preventDefault(); document.querySelectorAll('.filter-chip')[parseInt(e.key,10)-1]?.click(); return; }

    const cards = Array.from(list?.querySelectorAll('.item-card') || []); if (!cards.length) return;
    const card = document.activeElement?.closest?.('.item-card'), idx = card ? cards.indexOf(card) : -1;

    if (e.key === 'ArrowDown' || e.key === 'j') { e.preventDefault(); const el = cards[idx < cards.length - 1 ? idx + 1 : 0]; el?.focus(); el?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }
    else if (e.key === 'ArrowUp' || e.key === 'k') { e.preventDefault(); const el = cards[idx > 0 ? idx - 1 : cards.length - 1]; el?.focus(); el?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }
    else if (card) {
      const it = items.find(i => i.id === card.dataset.id); if (!it) return;
      if (e.key === 'Enter') { e.preventDefault(); openItem(it, false); }
      else if (e.key === ' ' || e.key === 'Spacebar') { e.preventDefault(); items = await Storage.toggleRead(it.id); updateCardDOM(card, items.find(i => i.id === it.id)); }
      else if (e.key.toLowerCase() === 's' || e.key.toLowerCase() === 'f') {
        e.preventDefault(); items = await Storage.togglePin(it.id);
        const upd = items.find(i => i.id === it.id); updateCardDOM(card, upd);
        if (upd?.isPinned) { const h = card.querySelector('.action-btn.star'); if (h) { h.classList.add('heart-pop'); setTimeout(() => h.classList.remove('heart-pop'), 250); } }
      }
      else if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); showConfirm(t('deleteConfirm', 'Bu öğeyi silmek istediğinize emin misiniz?'), async () => { items = await Storage.deleteItem(it.id); removeCardWithAnimation(card); }); }
    }
  });

  try {
    settings = await Storage.getSettings(); currentFilter = settings.lastFilter || 'all';
    filterChips.forEach(c => c.classList.toggle('active', c.getAttribute('data-filter') === currentFilter));
    if (typeof I18n !== 'undefined') { await I18n.init(settings.language); I18n.applyTranslations(); document.documentElement.lang = I18n.currentLang; }
    if (typeof ThemeManager !== 'undefined') ThemeManager.init(settings.theme);
  } catch (e) { console.warn('Readmark: init error', e); }

  await loadAndRender();
});
