/**
 * Readmark - Options & Settings Controller
 */
const $ = id => document.getElementById(id);
const setIcon = (id, svg) => { const el = $(id); if (el && svg) el.innerHTML = svg; };
const t = (k, fb) => typeof I18n !== 'undefined' ? I18n.t(k, fb) : fb;

function switchTab(tabId) {
  if (!tabId) return;
  document.querySelectorAll('.nav-item').forEach(i => i.classList.toggle('active', i.dataset.tab === tabId));
  document.querySelectorAll('.tab-panel').forEach(p => { const ok = p.id === `tab-${tabId}`; p.classList.toggle('active', ok); p.style.display = ok ? 'block' : 'none'; });
  if (tabId === 'stats') refreshStats();
}

async function refreshStats() {
  if (typeof Storage === 'undefined' || !Storage.getStats) return;
  const s = await Storage.getStats();
  ['Total', 'Unread', 'Read', 'Starred'].forEach(k => $(`stat${k}`) && ($(`stat${k}`).textContent = s[k.toLowerCase()]));
  if ($('statStorageBytes')) $('statStorageBytes').textContent = s.bytes;
}

let toastTimer;
function showToast(msg) {
  const toast = $('toast'); if (!toast) return;
  toast.textContent = msg; toast.classList.remove('hidden');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.add('hidden'), 2000);
}

function downloadFile(content, filename, mimeType) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([content], { type: mimeType })); a.download = filename;
  document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(a.href);
}

document.addEventListener('DOMContentLoaded', async () => {
  // Inject All Icons
  ['brandLogo:logo', 'aboutLogo:logo', 'navIconGeneral:settings', 'navIconBackup:download', 'navIconStats:barChart', 'navIconAbout:info',
   'themeIconSystem:monitor', 'themeIconLight:sun', 'themeIconDark:moon', 'exportIconJson:download', 'exportIconHtml:fileText',
   'exportIconMd:code', 'importDropIcon:upload', 'statIconTotal:bookmark', 'statIconUnread:circle', 'statIconRead:checkCircle',
   'statIconStarred:heartFilled', 'githubIcon:github', 'copyIcon:copy'].forEach(p => { const [id, k] = p.split(':'); setIcon(id, Icons[k]); });

  document.querySelector('.sidebar-nav')?.addEventListener('click', e => { const id = e.target.closest('.nav-item')?.dataset.tab; if (id) switchTab(id); });
  switchTab('general');

  // Load and apply settings
  const settings = await Storage.getSettings();
  if (typeof I18n !== 'undefined') {
    await I18n.init(settings.language); I18n.applyTranslations();
    document.title = `Readmark - ${t('settings', 'Settings')}`; document.documentElement.lang = I18n.currentLang;
  }
  if (typeof ThemeManager !== 'undefined') ThemeManager.init(settings.theme);

  const manifestVer = (typeof chrome !== 'undefined' && chrome.runtime?.getManifest?.()?.version) ? `v${chrome.runtime.getManifest().version}` : 'v1.2.0';
  if ($('versionBadge')) $('versionBadge').textContent = manifestVer;
  if ($('aboutVersionTag')) $('aboutVersionTag').textContent = manifestVer;

  const themeRadio = document.querySelector(`input[name="theme"][value="${settings.theme || 'system'}"]`);
  if (themeRadio) themeRadio.checked = true;
  if ($('languageSelect')) $('languageSelect').value = settings.language || 'system';
  if ($('showBadgeCheckbox')) $('showBadgeCheckbox').checked = settings.showBadgeCount !== false;
  if ($('autoMarkReadCheckbox')) $('autoMarkReadCheckbox').checked = Boolean(settings.autoMarkReadOnOpen);
  if ($('enableContextMenuCheckbox')) $('enableContextMenuCheckbox').checked = settings.enableContextMenu !== false;
  refreshStats();

  // Settings Event Listeners
  document.querySelectorAll('input[name="theme"]').forEach(r => r.addEventListener('change', async e => {
    ThemeManager.set(e.target.value); await Storage.saveSettings({ theme: e.target.value }); showToast(t('saveSuccess', 'Ayarlar kaydedildi.'));
  }));

  $('languageSelect')?.addEventListener('change', async e => {
    await I18n.setLang(e.target.value);
    document.title = `Readmark - ${t('settings', 'Settings')}`; document.documentElement.lang = I18n.currentLang;
    await Storage.saveSettings({ language: e.target.value }); showToast(t('saveSuccess', 'Ayarlar kaydedildi.'));
  });

  const bindToggle = (id, key, cb) => $(id)?.addEventListener('change', async e => {
    await Storage.saveSettings({ [key]: e.target.checked }); if (cb) cb(e.target.checked); showToast(t('saveSuccess', 'Ayarlar kaydedildi.'));
  });
  bindToggle('showBadgeCheckbox', 'showBadgeCount', async () => Storage.updateBadge(await Storage.getItems()));
  bindToggle('autoMarkReadCheckbox', 'autoMarkReadOnOpen');
  bindToggle('enableContextMenuCheckbox', 'enableContextMenu');

  // Exports
  const dStr = new Date().toISOString().slice(0, 10);
  $('btnExportJson')?.addEventListener('click', async () => { downloadFile(await Storage.exportJSON(), `readmark-backup-${dStr}.json`, 'application/json'); showToast(t('exportedJson', 'JSON indirildi')); });
  $('btnExportHtml')?.addEventListener('click', async () => { downloadFile(await Storage.exportHTML(), `readmark-bookmarks-${dStr}.html`, 'text/html'); showToast(t('exportedHtml', 'HTML indirildi')); });
  $('btnExportMd')?.addEventListener('click', async () => { downloadFile(await Storage.exportMarkdown(), `readmark-reading-list-${dStr}.md`, 'text/markdown'); showToast(t('exportedMd', 'Markdown indirildi')); });

  // File Import
  const dropZone = $('dropZone'), fileInput = $('fileInput');
  const handleFile = file => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async e => {
      try {
        const res = await Storage.importData(e.target.result, file.name.endsWith('.json') ? 'json' : 'html');
        showToast(`${res.importedCount} ${t('importSuccess', 'öğe başarıyla içe aktarıldı!')}`); refreshStats();
      } catch { showToast(t('importError', 'Geçersiz dosya formatı.')); }
    };
    reader.readAsText(file);
  };

  if (dropZone && fileInput) {
    ['dragover', 'drop'].forEach(ev => dropZone.addEventListener(ev, e => e.preventDefault()));
    dropZone.addEventListener('dragover', () => dropZone.classList.add('dragover'));
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
    dropZone.addEventListener('drop', e => { dropZone.classList.remove('dragover'); handleFile(e.dataTransfer?.files?.[0]); });
    fileInput.addEventListener('change', e => { handleFile(e.target.files?.[0]); fileInput.value = ''; });
  }

  // Confirm Modal & Reset
  let confirmCallback = null;
  const showConfirm = (text, onOk) => {
    if ($('confirmText')) $('confirmText').textContent = text;
    if ($('btnConfirmCancel')) $('btnConfirmCancel').textContent = t('cancel', 'İptal');
    if ($('btnConfirmOk')) $('btnConfirmOk').textContent = t('confirm', 'Onayla');
    confirmCallback = onOk;
    $('confirmDialog')?.classList.remove('hidden');
  };
  const closeConfirm = () => { $('confirmDialog')?.classList.add('hidden'); confirmCallback = null; };
  $('btnConfirmCancel')?.addEventListener('click', closeConfirm);
  $('btnConfirmOk')?.addEventListener('click', async () => {
    if (confirmCallback) {
      const cb = confirmCallback;
      closeConfirm();
      await cb();
    }
  });

  document.addEventListener('keydown', e => {
    if (!$('confirmDialog')?.classList.contains('hidden')) {
      if (e.key === 'Escape') { e.preventDefault(); closeConfirm(); }
      else if (e.key === 'Enter') { e.preventDefault(); $('btnConfirmOk')?.click(); }
    }
  });

  $('btnClearAllData')?.addEventListener('click', () => {
    showConfirm(t('clearAllConfirm', 'DİKKAT! Okuma listenizdeki tüm veriler silinecektir. Devam etmek istiyor musunuz?'), async () => {
      await Storage.clearAll(); await refreshStats(); showToast(t('dataReset', 'Tüm veriler sıfırlandı'));
    });
  });

  // License (GNU GPLv3)
  const GPL_LICENSE = `GNU GENERAL PUBLIC LICENSE\nVersion 3, 29 June 2007\n\nCopyright (C) 2026 Readmark Open Source Contributors\n\nThis program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.\n\nThis program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.\n\nYou should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.`;
  if ($('licenseText')) $('licenseText').textContent = GPL_LICENSE;
  $('btnCopyLicense')?.addEventListener('click', () => navigator.clipboard?.writeText($('licenseText')?.textContent || '').then(() => showToast(t('copied', 'Kopyalandı!'))).catch(() => {}));
});
