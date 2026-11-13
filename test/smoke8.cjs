// Thiết lập từng việc của bước trong popup: thẻ có tóm tắt, bấm thẻ mở popup, Esc / nền / Xong đóng, bật công tắc tự mở, đổi bước tự đóng.
const fs = require('fs'); const { JSDOM } = require('jsdom');
const html = fs.readFileSync(__dirname + '/../index.html', 'utf8');
const dom = new JSDOM('<!doctype html><html><head></head><body>' + html + '</body></html>', { runScripts: 'dangerously', url: 'https://x.test/#quy-trinh', pretendToBeVisual: true,
  beforeParse(win){ win.TextEncoder = require('util').TextEncoder; win.matchMedia = () => ({ matches: false }); } });
const w = dom.window, d = w.document; const errs = [];
w.addEventListener('error', e => errs.push('ERR ' + e.message));
w.scrollTo = () => {}; w.HTMLElement.prototype.scrollIntoView = function () {};
const q = s => d.querySelector(s), qa = s => Array.from(d.querySelectorAll(s));
const click = sel => { const el = typeof sel === 'string' ? q(sel) : sel; if (!el) throw new Error('khong thay ' + sel); el.dispatchEvent(new w.MouseEvent('click', { bubbles: true })); };
const change = (el, v) => { if (typeof el === 'string') el = q(el); if (!el) throw new Error('khong thay phan tu'); if (typeof v === 'boolean') el.checked = v; else el.value = v; el.dispatchEvent(new w.Event('change', { bubbles: true })); };
const T = (name, fn) => { try { fn(); console.log('OK   ' + name); } catch (e) { console.log('FAIL ' + name + ' -> ' + e.message); errs.push(name); } };
const open = () => !q('#capmodal').hidden;
const card = k => q('[data-act="capopen"][data-k="' + k + '"]');

setTimeout(() => {
  T('trang bước không còn các mục thiết lập xếp chồng', () => {
    click('tr[data-pid="kho-nhap-vt"]'); click('[data-act="step"][data-i="3"]');
    if (q('#editor #sec-ai') || q('#editor #sec-ten') || q('#editor #sec-chain')) throw new Error('van con muc trong trang');
    if (qa('#editor .caps .cap').length !== 7) throw new Error('so the ' + qa('#editor .caps .cap').length);
  });
  T('thẻ việc đang bật có tóm tắt + "Thiết lập ›"; thẻ tắt hiện mô tả', () => {
    if (!/Thiết lập ›/.test(card('ai').textContent)) throw new Error(card('ai').textContent);
    if (!/Mẫu: /.test(card('ai').textContent)) throw new Error('tom tat AI ' + card('ai').textContent);
    if (/Thiết lập/.test(card('office').textContent)) throw new Error('the tat van hien thiet lap');
  });
  T('bấm thẻ -> popup đúng việc, có tên quy trình + bước; Esc đóng', () => {
    click(card('ai'));
    if (!open() || q('#cm-title').textContent !== 'Đọc tài liệu bằng AI') throw new Error('khong mo / sai tieu de');
    if (!/Nhập vật tư_BHCK · bước "/.test(q('#cm-sub').textContent)) throw new Error(q('#cm-sub').textContent);
    if (!q('#capmodal #f-ai')) throw new Error('khong co o mau AI');
    d.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    if (open()) throw new Error('Esc khong dong');
    if (q('#f-ai')) throw new Error('noi dung popup con trong trang');
  });
  T('bấm nền / nút Xong đóng popup', () => {
    click(card('ten')); click('#capmodal'); if (open()) throw new Error('nen khong dong');
    click(card('ten')); click('#capmodal .cm-f [data-act="capclose"]'); if (open()) throw new Error('Xong khong dong');
  });
  T('bật việc bằng công tắc -> tự mở popup; chọn xong tóm tắt trên thẻ cập nhật', () => {
    change('#cap-office', true);
    if (!open() || !q('#capmodal #f-office')) throw new Error('khong tu mo');
    if (!/⚠ Chưa chọn đơn vị Office/.test(card('office').textContent)) throw new Error('khong canh bao chua chon');
    change('#f-office', 'BHCK');
    if (!open() || !q('#capmodal #f-office')) throw new Error('popup dong sau khi chon');
    if (!/Đơn vị BHCK/.test(card('office').textContent)) throw new Error('tom tat chua cap nhat: ' + card('office').textContent);
  });
  T('tắt việc ở chân popup -> đóng popup, thẻ về trạng thái tắt', () => {
    click('#cm-off'); if (open()) throw new Error('khong dong');
    if (q('#cap-office').checked) throw new Error('van bat');
  });
  T('bấm thẻ đang tắt -> bật luôn + mở popup', () => {
    click(card('lt')); if (!open() || !q('#capmodal #sec-lt')) throw new Error('khong mo'); if (!q('#cap-lt').checked) throw new Error('khong bat');
    click('#cm-off');
  });
  T('chuỗi chức năng: 1 dòng tóm tắt, bấm mở popup sửa được', () => {
    const row = card('chain'); if (!/\d+ chức năng/.test(row.textContent)) throw new Error(row.textContent);
    click(row); if (!open() || !q('#capmodal #sec-chain')) throw new Error('khong mo chuoi');
    change('#ch-custom', true); if (!q('#capmodal .chain input.cond')) throw new Error('khong sua duoc');
    if (!/chuỗi riêng/.test(card('chain').textContent)) throw new Error('dong tom tat chua cap nhat');
  });
  T('đổi sang bước khác -> popup tự đóng', () => { click('[data-act="step"][data-i="1"]'); if (open()) throw new Error('van mo'); });
  console.log(errs.length ? '\nLOI: ' + errs.join(' | ') : '\nTAT CA OK');
  process.exit(errs.length ? 1 : 0);
}, 60);
