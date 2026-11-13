// Hộp thoại: xuất bản xem lại + chặn khi còn lỗi, nhân bản trùng tên, thêm bước trùng Block ID, Esc / nền / Enter.
const fs = require('fs'); const { JSDOM } = require('jsdom');
const html = fs.readFileSync(__dirname + '/../index.html', 'utf8');
const dom = new JSDOM('<!doctype html><html><head></head><body>' + html + '</body></html>', { runScripts: 'dangerously', url: 'https://x.test/#quy-trinh', pretendToBeVisual: true,
  beforeParse(win){ win.TextEncoder = require('util').TextEncoder; win.matchMedia = () => ({ matches: false }); } });
const w = dom.window, d = w.document; const errs = [];
w.addEventListener('error', e => errs.push('ERR ' + e.message));
w.scrollTo = () => {}; w.HTMLElement.prototype.scrollIntoView = function () {};
const q = s => d.querySelector(s), qa = s => Array.from(d.querySelectorAll(s));
const click = sel => { const el = typeof sel === 'string' ? q(sel) : sel; if (!el) throw new Error('khong thay ' + sel); el.dispatchEvent(new w.MouseEvent('click', { bubbles: true })); };
const input = (sel, v) => { const el = q(sel); el.value = v; el.dispatchEvent(new w.Event('input', { bubbles: true })); };
const key = (k, el) => (el || d.activeElement || d).dispatchEvent(new w.KeyboardEvent('keydown', { key: k, bubbles: true }));
const T = (name, fn) => { try { fn(); console.log('OK   ' + name); } catch (e) { console.log('FAIL ' + name + ' -> ' + e.message); errs.push(name); } };
const open = () => !q('#dlg').hidden;
const go = h => { w.location.hash = h; w.dispatchEvent(new w.HashChangeEvent('hashchange')); };

setTimeout(() => {
  T('Esc và bấm nền đóng hộp thoại, không làm gì', () => {
    click('tr[data-pid="kho-nhap-vt"]');
    const n = qa('#rail .step').length;
    click('[data-act="askdelstep"]'); if (!open()) throw new Error('khong mo'); key('Escape'); if (open()) throw new Error('Esc khong dong');
    click('[data-act="askdelstep"]'); click('#dlg'); if (open()) throw new Error('nen khong dong');
    if (qa('#rail .step').length !== n) throw new Error('van xoa');
  });
  T('thêm bước: Block ID trùng trong quy trình bị chặn; Enter để xác nhận', () => {
    const n = qa('#rail .step').length;
    click('[data-act="addstep"]');
    q('#dlg-block').value = '51151'; q('#dlg-sname').value = 'Trùng'; click('#dlg-ok');
    if (!/đã có bước/.test(q('#dlg-err').textContent)) throw new Error('khong chan trung: ' + q('#dlg-err').textContent);
    q('#dlg-block').value = '77777'; q('#dlg-sname').value = 'Bước Enter'; key('Enter', q('#dlg-sname'));
    if (open() || qa('#rail .step').length !== n + 1) throw new Error('Enter khong them');
  });
  T('nhân bản: trùng tên quy trình có sẵn bị chặn', () => {
    click('[data-act="dupproc"]'); q('#dlg-pname').value = 'Xuất vật tư_BHCK'; click('#dlg-ok');
    if (!/Đã có quy trình tên/.test(q('#dlg-err').textContent)) throw new Error('khong chan trung ten');
    click('#dlg-cancel');
  });
  T('xuất bản: liệt kê thay đổi theo quy trình + bước', () => {
    click('#publish'); const t = q('#dlg-body').textContent;
    if (!/Nhập vật tư_BHCK/.test(t) || !/thêm bước/.test(t)) throw new Error(t.slice(0, 300));
    if (q('#dlg-ok').disabled) throw new Error('bi chan khong ly do');
    click('#dlg-cancel');
  });
  T('xuất bản bị chặn khi còn lỗi (lịch có điều kiện sai, chạy bóng thiếu địa chỉ)', () => {
    go('quy-tac'); click('[data-act="rtab"][data-v="lich"]');
    const dk = q('#lich-dk-2'); dk.value = 'thoi_gian lung tung'; dk.dispatchEvent(new w.Event('change', { bubbles: true }));
    click('#publish');
    if (!q('#dlg-ok').disabled || !/lỗi phải sửa/.test(q('#dlg-body').textContent) || !/Nhắc văn bản đến quá hạn/.test(q('#dlg-body').textContent)) throw new Error(q('#dlg-body').textContent.slice(0, 300));
    click('#dlg-cancel');
  });
  T('đổi chế độ rồi huỷ -> giữ chế độ cũ', () => {
    go('quy-trinh'); if (!q('#f-mode')) click('tr[data-pid="kho-nhap-vt"]');
    const s = q('#f-mode'); s.value = 'bong'; s.dispatchEvent(new w.Event('change', { bubbles: true }));
    if (!open()) throw new Error('khong hoi'); click('#dlg-cancel');
    if (q('#f-mode').value !== 'that' || /Đang chuyển dần/.test(q('#view').textContent)) throw new Error('van doi');
  });
  console.log(errs.length ? '\nLOI: ' + errs.join(' | ') : '\nTAT CA OK');
  process.exit(errs.length ? 1 : 0);
}, 60);
