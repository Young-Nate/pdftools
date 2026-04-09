// Shared upload zone logic
function initUploadZone({ zoneId, inputId, accept = '.pdf', multiple = false, onFiles }) {
  const zone = document.getElementById(zoneId);
  const input = document.getElementById(inputId);
  if (!zone || !input) return;

  // Drag events
  zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('drag-over'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
  zone.addEventListener('drop', e => {
    e.preventDefault();
    zone.classList.remove('drag-over');
    const files = [...e.dataTransfer.files].filter(f => matchesAccept(f, accept));
    if (files.length) onFiles(multiple ? files : [files[0]]);
  });
  input.addEventListener('change', () => {
    const files = [...input.files];
    if (files.length) onFiles(multiple ? files : [files[0]]);
    input.value = '';
  });
}

function matchesAccept(file, accept) {
  if (!accept || accept === '*') return true;
  return accept.split(',').some(a => {
    a = a.trim();
    if (a.startsWith('.')) return file.name.toLowerCase().endsWith(a);
    if (a.endsWith('/*')) return file.type.startsWith(a.slice(0, -1));
    return file.type === a;
  });
}

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
}

function showStatus(id, msg, type = 'processing') {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = msg;
  el.className = 'status-message ' + type;
  el.classList.remove('hidden');
}

function hideStatus(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('hidden');
}

function showProgress(id, pct) {
  const bar = document.getElementById(id);
  if (bar) bar.style.width = pct + '%';
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

function showResult({ cardId, titleId, subtitleId, btnId, blob, filename }) {
  const card = document.getElementById(cardId);
  if (!card) return;
  card.classList.remove('hidden');
  if (titleId) document.getElementById(titleId).textContent = 'Done!';
  const btn = document.getElementById(btnId);
  if (btn && blob) {
    btn.onclick = () => downloadBlob(blob, filename);
  }
}

function renderFileItem(file, index, onRemove) {
  const div = document.createElement('div');
  div.className = 'file-item';
  div.dataset.index = index;
  div.innerHTML = `
    <div class="file-item-icon">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
      </svg>
    </div>
    <div class="file-item-info">
      <div class="file-item-name">${file.name}</div>
      <div class="file-item-size">${formatBytes(file.size)}</div>
    </div>
    <button class="file-item-remove" title="Remove file" aria-label="Remove ${file.name}">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M18 6L6 18M6 6l12 12"/>
      </svg>
    </button>`;
  div.querySelector('.file-item-remove').onclick = () => onRemove(index);
  return div;
}
