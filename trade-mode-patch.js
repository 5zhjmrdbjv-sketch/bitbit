
(function () {
  const MODE_KEY = 'btc_trade_mode_v1';
  const LABEL_STYLE_ID = 'trade-mode-patch-style';

  function $(id) { return document.getElementById(id); }
  function text(id) { const el = $(id); return el ? el.textContent.trim() : ''; }
  function setText(id, value) { const el = $(id); if (el) el.textContent = value; }

  function ensureStyle() {
    if ($(LABEL_STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = LABEL_STYLE_ID;
    style.textContent = `
      .trade-mode-panel { display:flex; align-items:center; justify-content:space-between; gap:10px; background:var(--bg2); border-radius:var(--radius); padding:9px 10px; margin:0 0 12px; }
      .trade-mode-panel label { font-size:11px; color:var(--text3); text-transform:uppercase; letter-spacing:.04em; }
      .trade-mode-panel select { font-size:13px; padding:6px 10px; border-radius:var(--radius); border:.5px solid var(--border2); background:var(--bg); color:var(--text); outline:none; }
      .spot-only-note { margin-top:10px; background:var(--red-bg); color:var(--red); border-radius:var(--radius); padding:9px 10px; font-size:12px; line-height:1.55; }
    `;
    document.head.appendChild(style);
  }

  function getMode() {
    return localStorage.getItem(MODE_KEY) || 'spot';
  }

  function setMode(mode) {
    localStorage.setItem(MODE_KEY, mode);
    applyTradeModeDisplay();
  }

  function ensureModeControl() {
    if ($('trade-mode-select')) return;
    const safetyCard = document.querySelector('.safety-card');
    const riskControls = document.querySelector('.risk-controls');
    if (!safetyCard || !riskControls) return;

    const panel = document.createElement('div');
    panel.className = 'trade-mode-panel';
    panel.innerHTML = `
      <label for="trade-mode-select">取引モード</label>
      <select id="trade-mode-select">
        <option value="spot">現物ロングのみ</option>
        <option value="both">ロング/ショート両対応</option>
      </select>
    `;
    riskControls.parentNode.insertBefore(panel, riskControls);
    const select = $('trade-mode-select');
    select.value = getMode();
    select.addEventListener('change', () => setMode(select.value));
  }

  function setCellLabel(valueId, labelText) {
    const valueEl = $(valueId);
    const cell = valueEl ? valueEl.closest('.safety-cell') : null;
    const label = cell ? cell.querySelector('.safety-label') : null;
    if (label) label.textContent = labelText;
  }

  function setTradeLabel(valueId, labelText) {
    const valueEl = $(valueId);
    const cell = valueEl ? valueEl.closest('.trade-cell') : null;
    const label = cell ? cell.querySelector('.trade-label') : null;
    if (label) label.textContent = labelText;
  }

  function ensureSpotNote(message) {
    let note = $('spot-only-note');
    const rationale = $('entry-rationale');
    if (!note && rationale) {
      note = document.createElement('div');
      note.id = 'spot-only-note';
      note.className = 'spot-only-note';
      rationale.parentNode.insertBefore(note, rationale.nextSibling);
    }
    if (note) {
      note.textContent = message;
      note.style.display = message ? 'block' : 'none';
    }
  }

  function appendRationaleOnce(extra) {
    const body = $('entry-rationale-body');
    if (!body || !extra) return;
    const base = body.textContent.replace(/\s*現物ロングのみモードでは[\s\S]*$/, '').trim();
    body.textContent = base + ' ' + extra;
  }

  function applyTradeModeDisplay() {
    ensureStyle();
    ensureModeControl();

    const mode = getMode();
    const direction = text('safety-direction');
    const isShort = direction.includes('ショート');
    const isLong = direction.includes('ロング');

    if (mode === 'spot') {
      setCellLabel('safety-entry', '買い候補');
      setCellLabel('safety-stop', '損切り目安');
      setCellLabel('safety-target', '利確目安');
      setCellLabel('safety-size', '買付上限');
      setTradeLabel('plan-entry', '買い候補');
      setTradeLabel('plan-stop', '損切り');
      setTradeLabel('plan-target', '利確');
      setTradeLabel('plan-size', '買付上限');

      if (isShort) {
        setText('safety-direction', '下落警戒');
        setText('safety-entry', '--');
        setText('safety-stop', '--');
        setText('safety-target', '--');
        setText('safety-size', '--');
        setText('plan-entry', '--');
        setText('plan-stop', '--');
        setText('plan-target', '--');
        setText('plan-size', '--');
        const status = $('safety-status');
        if (status) {
          status.className = 'signal signal-risk';
          status.textContent = '🔴 買い見送り';
        }
        const score = $('safety-score');
        if (score) {
          score.textContent = '買い見送り';
          score.className = 'safety-value entry-score-skip';
        }
        ensureSpotNote('現物ロングのみモード：現在はショート寄り＝下落警戒のため、買いエントリー・利確・推奨数量は表示しません。買うならロング条件がそろうまで待つ場面です。');
        appendRationaleOnce('現物ロングのみモードでは、ショート寄りの場面は「買い見送り」として扱います。');
      } else {
        ensureSpotNote('');
      }
      return;
    }

    // both mode: make long/short labels explicit so target below entry is not confusing.
    ensureSpotNote('');
    if (isShort) {
      setCellLabel('safety-entry', 'ショート入口');
      setCellLabel('safety-stop', '損切り(上)');
      setCellLabel('safety-target', '利確/買戻し');
      setCellLabel('safety-size', '上限数量');
      setTradeLabel('plan-entry', 'ショート入口');
      setTradeLabel('plan-stop', '損切り(上)');
      setTradeLabel('plan-target', '利確/買戻し');
      setTradeLabel('plan-size', '上限数量');
    } else if (isLong) {
      setCellLabel('safety-entry', '買い入口');
      setCellLabel('safety-stop', '損切り(下)');
      setCellLabel('safety-target', '利確/売却');
      setCellLabel('safety-size', '買付上限');
      setTradeLabel('plan-entry', '買い入口');
      setTradeLabel('plan-stop', '損切り(下)');
      setTradeLabel('plan-target', '利確/売却');
      setTradeLabel('plan-size', '買付上限');
    } else {
      setCellLabel('safety-entry', 'エントリー');
      setCellLabel('safety-stop', '損切り目安');
      setCellLabel('safety-target', '利確目安');
      setCellLabel('safety-size', '上限数量');
      setTradeLabel('plan-entry', 'エントリー');
      setTradeLabel('plan-stop', '損切り');
      setTradeLabel('plan-target', '利確');
      setTradeLabel('plan-size', '推奨数量');
    }
  }

  function patchUpdateSafetyPanel() {
    if (window.__tradeModePatchApplied) return;
    window.__tradeModePatchApplied = true;
    const original = window.updateSafetyPanel;
    if (typeof original === 'function') {
      window.updateSafetyPanel = function patchedUpdateSafetyPanel() {
        const result = original.apply(this, arguments);
        setTimeout(applyTradeModeDisplay, 0);
        return result;
      };
    }
  }

  function init() {
    ensureStyle();
    ensureModeControl();
    patchUpdateSafetyPanel();
    applyTradeModeDisplay();
    setInterval(applyTradeModeDisplay, 2500);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
