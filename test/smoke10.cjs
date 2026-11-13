// AI đọc file riêng, lưu thêm file thứ 2 riêng, chuỗi hiện tham số file; lưu đồ ngang / dọc.
const fs = require('fs'); const { JSDOM } = require('jsdom');
const html = fs.readFileSync(__dirname + '/../index.html', 'utf8');
const dom = new JSDOM('<!doctype html><html><head></head><body>' + html + '</body></html>', { runScripts: 'dangerously', url: 'https://x.test/#quy-trinh', pretendToBeVisual: true,
  beforeParse(win){ win.TextEncoder = require('util').TextEncoder; win.matchMedia = () => ({ matches: false }); } });
const w = dom.window, d = w.document; const errs = [];
w.addEventListener('error', e => errs.push('ERR ' + e.message));
w.scrollTo = () => {}; w.HTMLElement.prototype.scrollIntoView = function () {};
const q = s => d.querySelector(s);
const click = sel => { const el = typeof sel === 'string' ? q(sel) : sel; if (!el) throw new Error('khong thay ' + sel); el.dispatchEvent(new w.MouseEvent('click', { bubbles: true })); };
const pick = (sel, v) => { const el = q(sel); if (!el) throw new Error('khong thay ' + sel); el.value = v; if (el.value !== v) throw new Error(sel + ' khong co lua chon ' + v); el.dispatchEvent(new w.Event('change', { bubbles: true })); };
const T = (name, fn) => { try { fn(); console.log('OK   ' + name); } catch (e) { console.log('FAIL ' + name + ' -> ' + e.message); errs.push(name); } };
const capOn = k => { const c = q('#cap-' + k); if (!c.checked){ c.checked = true; c.dispatchEvent(new w.Event('change', { bubbles: true })); } };
const chainText = () => { click('[data-act="capclose"]'); click('[data-act="capopen"][data-k="chain"]'); const t = q('#cm-body').textContent; click('[data-act="capclose"]'); return t; };

setTimeout(() => {
  T('AI đọc file riêng: chọn trường khác cho AI -> chuỗi không tải file chính, doc_ai đọc riêng, không cảnh báo', () => {
    click('tr[data-pid="kho-nhap-vt"]');
    capOn('ai');
    if (q('#capmodal').hidden) click('[data-act="capopen"][data-k="ai"]');
    pick('#f-ai', 'Kho – đọc chứng từ đề xuất');
    pick('#f-aisrc', 'Hồ sơ nhập - xuất kho');
    if (!q('#f-aipick')) throw new Error('khong hien o chon file');
    q('#f-aipick').value = 'da ky'; q('#f-aipick').dispatchEvent(new w.Event('change', { bubbles: true }));
    const t = chainText();
    if (!/Đọc riêng: .*\(da ky\)/.test(t)) throw new Error('chuoi khong ghi doc rieng: ' + t.slice(0, 400));
    if (/cần "file_nguon"/.test(t)) throw new Error('van canh bao file_nguon');
    const card = q('[data-act="capopen"][data-k="ai"]').textContent; if (!/đọc riêng Hồ sơ nhập - xuất kho/.test(card)) throw new Error('the tom tat chua doi: ' + card);
  });
  T('lưu thêm file thứ 2: chọn "File AI đã đọc" + thư mục riêng -> thêm 1 chức năng lưu riêng vào chuỗi', () => {
    capOn('file');
    if (q('#capmodal').hidden || !q('#f-src2')) click('[data-act="capopen"][data-k="file"]');
    pick('#f-src2', 'File AI đã đọc');
    pick('#f-drive2', 'Kho – Xuất vật tư');
    if (q('#f-pick2')) throw new Error('file AI khong can o chon file');
    const t = chainText();
    if (!/Lưu riêng: file AI đã đọc → Shared drives/.test(t)) throw new Error(t.slice(0, 500));
    if (!/lưu thêm File AI đã đọc/.test(q('.cap.on [data-k="file"]').textContent)) throw new Error('the file chua doi');
  });
  T('lưu đồ: mặc định ngang, bấm Dọc / Ngang đổi hướng, sơ đồ vẫn bấm được', () => {
    click('[data-act="ptab"][data-v="flow"]');
    if (!q('#fcd').classList.contains('fc-h')) throw new Error('mac dinh khong ngang');
    click('[data-act="fdir"][data-v="doc"]');
    if (q('#fcd').classList.contains('fc-h')) throw new Error('khong doi sang doc');
    if (q('[data-act="fdir"][data-v="doc"]').getAttribute('aria-pressed') !== 'true') throw new Error('nut khong sang');
    click('[data-act="fdir"][data-v="ngang"]');
    if (!q('#fcd').classList.contains('fc-h')) throw new Error('khong ve ngang');
    const hk = q('#fcd [data-act="fcpick"]'); if (!hk) throw new Error('khong co khoi'); click(hk);
    if (!q('#fpanel').textContent.trim()) throw new Error('bang ben khong hien');
  });
  if (errs.length) { console.log('\nLOI: ' + errs.join(' | ')); process.exit(1); }
  console.log('\nTAT CA OK');
}, 300);
