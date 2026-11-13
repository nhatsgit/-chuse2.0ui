// Phần linh hoạt: chuỗi chức năng trong bước, chế độ chạy, chạy lại nhật ký, Quy tắc chung (vai trò, luồng, số, lịch).
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
const input = (el, v) => { if (typeof el === 'string') el = q(el); el.value = v; el.dispatchEvent(new w.Event('input', { bubbles: true })); };
const T = (name, fn) => { try { fn(); console.log('OK   ' + name); } catch (e) { console.log('FAIL ' + name + ' -> ' + e.message); errs.push(name); } };
const expose = () => { const v = d.createElement('script'); v.textContent = 'window.__P = P;'; d.body.appendChild(v); return w.__P; };
const go = h => { w.location.hash = h; w.dispatchEvent(new w.HashChangeEvent('hashchange')); };

setTimeout(() => {
  const openP = (pid) => { const bt = d.createElement('button'); bt.dataset.act = 'open'; bt.dataset.pid = pid; bt.dataset.si = '0'; d.body.appendChild(bt); click(bt); bt.remove(); };
  const order = () => qa('#sec-chain .chain li .ct b').map(x => x.textContent);
  T('bước cấp số: chuỗi suy ra = mẫu vt_di_cap_so', () => {
    openP('vti-bhck');
    const n = qa('#rail [data-act="step"][data-i]').length;
    let found = -1;
    for (let i = 0; i < n && found < 0; i++){ click('[data-act="step"][data-i="' + i + '"]'); if (/vt_di_cap_so/.test(q('#sec-chain').textContent)) found = i; }
    if (found < 0) throw new Error('khong co buoc cap so');
    if (qa('#sec-chain .chain li').length !== 9) throw new Error('so chuc nang ' + qa('#sec-chain .chain li').length);
  });
  T('tự sắp chuỗi: điều kiện sai -> cảnh báo; kiểm trùng trước cấp số -> cảnh báo thiếu "so"; thêm chức năng', () => {
    change('#ch-custom', true);
    if (qa('.chain input.cond').length !== 9) throw new Error('khong co o dieu kien');
    change(qa('.chain input.cond')[8], 'so_hieu lung tung');
    if (!/không hiểu/.test(q('#sec-chain .note').textContent)) throw new Error('khong bao dieu kien sai');
    change(qa('.chain input.cond')[8], 'luong là di');
    if (!/hợp lệ/.test(q('#sec-chain .note').textContent)) throw new Error('van loi: ' + q('#sec-chain .note').textContent);
    click('[data-act="ch-up"][data-i="2"]');
    if (order()[1] !== 'Kiểm tra trùng số / sai thứ tự') throw new Error(order().join('|'));
    if (!/cần "so"/.test(q('#sec-chain .note').textContent)) throw new Error('khong canh bao can so');
    click('[data-act="ch-down"][data-i="1"]');
    change('#ch-add', 'dung'); click('[data-act="ch-add"]');
    if (order().pop() !== 'Dừng chuỗi') throw new Error('khong them');
    click('[data-act="ch-tat"][data-i="9"]');
    if (!q('#sec-chain .chain li.off')) throw new Error('khong tat');
    if (!/Chuỗi riêng/.test(q('#rail').textContent)) throw new Error('rail khong danh dau');
    if (!/thay đổi chưa xuất bản/.test(q('#draft-pill').textContent)) throw new Error('khong danh dau thay doi');
  });
  T('về chuỗi suy ra', () => { click('[data-act="ch-reset"]'); if (q('#ch-custom').checked) throw new Error('van custom'); });
  T('chế độ chạy bóng: chưa khai URL -> cảnh báo; khai URL -> số khớp/lệch, xem chỗ lệch', () => {
    change('#f-mode', 'bong');
    if (!/Chưa khai địa chỉ Apps Script/.test(q('#view').textContent)) throw new Error('khong canh bao url');
    change('#f-fw', 'https://script.google.com/macros/s/XYZ/exec');
    if (!/lượt khớp/.test(q('#view').textContent)) throw new Error('khong co thong ke');
    const b = q('[data-act="shadowview"]'); if (b){ click(b); if (!/So sánh chạy bóng/.test(q('#drawer-panel').textContent)) throw new Error('drawer'); click('[data-act="close"]'); }
    change('#f-mode', 'chuyen_tiep'); if (!/một lần/.test(q('#view').textContent)) throw new Error('chuyen tiep');
  });
}, 60);
setTimeout(() => {
  T('nhật ký: chạy lại bỏ qua việc đã làm, làm lại hết', () => {
    go('nhat-ky');
    const n = qa('#logbody .logrow').length;
    click('[data-act="log"][data-i="0"]');
    if (!q('[data-act="replay"][data-all="0"]')) throw new Error('khong co nut chay lai');
    click('[data-act="replay"][data-all="0"]');
    if (qa('#logbody .logrow').length !== n + 1) throw new Error('khong them dong');
    if (!/Chạy lại lượt/.test(qa('#logbody .logrow')[0].textContent)) throw new Error(qa('#logbody .logrow')[0].textContent);
    click('[data-act="log"][data-i="0"]');
    if (!/Đã làm ở lần chạy trước/.test(q('#drawer-panel').textContent)) throw new Error('khong bo qua viec da lam');
    click('[data-act="replay"][data-all="1"]');
    click('[data-act="log"][data-i="0"]');
    if (/Đã làm ở lần chạy trước/.test(q('#drawer-panel').textContent)) throw new Error('lam lai het van bo qua');
    click('[data-act="close"]');
  });
  T('Quy tắc chung: 4 thẻ, vai trò trường đổi tên + cảnh báo không có trên form', () => {
    go('quy-tac');
    if (qa('[data-act="rtab"]').length !== 4) throw new Error('so the');
    if (qa('[data-rb="role"]').length < 28) throw new Error('so vai tro ' + qa('[data-rb="role"]').length);
    const sel = q('#r-proc'); change(sel, 'vti-bhck');
    if (!/Base không có trường này/.test(q('#view').textContent)) throw new Error('khong canh bao truong la');
    change(q('[data-rb="role"][data-k="nguoi_ky"]'), 'service_nguoi_ky_bhck');
    if (q('[data-rb="role"][data-k="nguoi_ky"]').value !== 'service_nguoi_ky_bhck') throw new Error('khong luu');
    click('[data-act="r-goiy"]');
  });
  T('giá trị luồng: thử giá trị, thêm dòng đồng nghĩa mới', () => {
    click('[data-act="rtab"][data-v="luong"]');
    input('#r-ltest', 'Xin giữ số trước'); if (!/Xin giữ số/.test(q('#r-lout').textContent)) throw new Error(q('#r-lout').textContent);
    input('#r-ltest', 'bu so'); if (!/Không nhận ra/.test(q('#r-lout').textContent)) throw new Error('khong dau van khop');
    click('[data-act="r-luong-add"]');
    const rows = qa('[data-rb="luong"][data-k="gia_tri"]'); change(rows[rows.length - 1], 'Đăng ký số'); change(qa('[data-rb="luong"][data-k="hanh_vi"]').pop(), 'giu_so');
    input('#r-ltest', 'Đăng ký số'); if (!/Xin giữ số/.test(q('#r-lout').textContent)) throw new Error('dong moi khong khop');
  });
  T('quy tắc số: thử cấp số theo quy tắc riêng (.1, không điền số trống)', () => {
    click('[data-act="rtab"][data-v="so"]');
    if (!/4\/KH-DU/.test(q('#r-sout').textContent)) throw new Error(q('#r-sout').textContent);
    change('#r-sqt', 'vti-bhck');
    const i = qa('[data-rb="so"][data-k="dien"]').length - 1; change(qa('[data-rb="so"][data-k="dien"]')[i], 'Không');
    if (!/3\.1\/KH-DU/.test(q('#r-sout').textContent)) throw new Error(q('#r-sout').textContent);
    change(qa('[data-rb="so"][data-k="mau"]')[i], '{so}-{ma_loai}/{ma_dv}/{yy}');
    if (!/3\.1-KH\/DU\/26/.test(q('#r-sout').textContent)) throw new Error(q('#r-sout').textContent);
  });
  T('lịch chạy: 3 lịch, điều kiện sai báo ngay, chạy thử giữ số -> 1 dòng, cấp 4/KH-DU', () => {
    click('[data-act="rtab"][data-v="lich"]');
    if (qa('[data-act="lich-thu"]').length !== 3) throw new Error('so lich');
    const dk = q('#lich-dk-2'); input(dk, 'thoi_gian lung tung'); if (!q('#lich-dke-2').textContent) throw new Error('khong bao loi');
    input(dk, 'thoi_gian_thuc_hien < hom_nay');
    click('[data-act="lich-thu"][data-i="1"]');
    const t = q('#drawer-panel').textContent;
    if (!/1 dòng thoả điều kiện/.test(t)) throw new Error(t.slice(0, 200));
    if (!/4\/KH-DU/.test(t)) throw new Error('khong cap so');
    click('[data-act="close"]');
  });
  T('xuất bản giữ cả quy tắc chung, cảnh báo đối chiếu Base hiện ở trang đầu', () => {
    const snap = JSON.parse(w.localStorage.getItem(Object.keys(w.localStorage).find(k => /dk|base|quy/i.test(k)) || Object.keys(w.localStorage)[0])).snap;
    if (!JSON.parse(snap).RULES || !JSON.parse(snap).RULES.vaitro['vti-bhck'].nguoi_ky) throw new Error('khong luu RULES');
    go('quy-trinh'); click('[data-act="back"]');
    if (!/khối webhook mới chưa cấu hình/.test(q('#view').textContent)) throw new Error('khong co canh bao doi chieu');
  });
  console.log(errs.length ? '\nLOI: ' + errs.join(' | ') : '\nTAT CA OK');
  process.exit(errs.length ? 1 : 0);
}, 400);
