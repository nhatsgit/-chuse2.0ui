const fs = require('fs'); const { JSDOM } = require('jsdom');
const html = fs.readFileSync(__dirname + '/../index.html', 'utf8');
const dom = new JSDOM('<!doctype html><html><head></head><body>' + html + '</body></html>', { runScripts: 'dangerously', url: 'https://x.test/#quy-trinh', pretendToBeVisual: true,
  beforeParse(win){ win.TextEncoder = require('util').TextEncoder; win.matchMedia = () => ({ matches: false }); } });
const w = dom.window, d = w.document; const errs = [];
w.addEventListener('error', e => errs.push('ERR ' + e.message));
w.matchMedia = w.matchMedia || (() => ({ matches: false }));
w.scrollTo = () => {}; w.HTMLElement.prototype.scrollIntoView = function () {};
const q = s => d.querySelector(s);
const click = sel => { const el = typeof sel === 'string' ? q(sel) : sel; if (!el) throw new Error('khong thay ' + sel); el.dispatchEvent(new w.MouseEvent('click', { bubbles: true })); };
const change = (el, v) => { if (!el) throw new Error('khong thay phan tu'); if (typeof v === 'boolean') el.checked = v; else el.value = v; el.dispatchEvent(new w.Event('change', { bubbles: true })); };
const input = (el, v) => { if (!el) throw new Error('khong thay o nhap'); el.value = v; el.dispatchEvent(new w.Event('input', { bubbles: true })); };
const T = (name, fn) => { try { fn(); console.log('OK   ' + name); } catch (e) { console.log('FAIL ' + name + ' -> ' + e.message); errs.push(name); } };
const later = (ms, fn) => setTimeout(fn, ms);

later(50, () => {
  T('danh sach quy trinh', () => { const n = d.querySelectorAll('#ptbody tr.row').length; if (n !== 15) throw new Error('so dong ' + n); });
  T('tim kiem "kho"', () => { input(q('#q'), 'kho'); const n = d.querySelectorAll('#ptbody tr.row').length; if (n !== 4) throw new Error('ra ' + n); input(q('#q'), ''); });
  T('loc nhom Bao cao', () => { click('[data-act="grp"][data-v="Báo cáo"]'); const n = d.querySelectorAll('#ptbody tr.row').length; if (n !== 3) throw new Error('ra ' + n); click('[data-act="grp"][data-v="Tất cả"]'); });
  T('mo chi tiet Nhap vat tu', () => { click('tr[data-pid="kho-nhap-vt"]'); if (!q('#editor')) throw new Error('khong co editor'); });
  T('chon buoc co AI', () => { click('[data-act="step"][data-i="3"]'); if (!q('#sec-ai')) throw new Error('khong thay muc AI'); });
  T('go ten phieu cap nhat xem truoc', () => { const ta = q('#f-name'); input(ta, ta.value + ' {service_khach_hang}'); if (!q('#pv-box em')) throw new Error('khong bao thieu du lieu'); });
  T('du lieu rat dai', () => { click('[data-act="sample"][data-v="1"]'); if (!q('#pv-box')) throw new Error('mat xem truoc'); });
  T('tat viec AI', () => { click('[data-act="capoff"][data-k="ai"]'); if (q('#sec-ai')) throw new Error('van con'); });
  T('bat lai AI bang cong tac', () => { change(q('#cap-ai'), true); if (!q('#sec-ai')) throw new Error('khong mo lai'); });
  T('bo chon truong: tim + tick', () => { click('[data-act="picker"]'); input(q('#pickq'), 'khách'); change(q('#picklist input[type=checkbox]'), true); if (!/Khách hàng/.test(q('#fchips').textContent)) throw new Error('chua them'); });
  T('bo mot truong', () => { const n = d.querySelectorAll('#fchips .fchip').length; click(q('#fchips [data-act="rmfield"]')); if (d.querySelectorAll('#fchips .fchip').length !== n - 1) throw new Error('khong bo'); });
  T('nap nhom truong', () => { change(q('#f-fieldset'), 'Kho nhập – Phiếu'); });
  T('bat Office + chon don vi', () => { change(q('#cap-office'), true); change(q('#f-office'), 'BHCK'); if (!/publisher-47/.test(q('#sec-office').innerHTML)) throw new Error('khong hien ma don vi'); });
  T('bat cho phieu khac di tiep', () => { change(q('#cap-exec'), true); if (!q('#f-exfield')) throw new Error('khong co o'); change(q('#f-exfield'), 'service_so_phieu'); });
  T('chay thu buoc', () => { click('[data-act="dry"]'); if (q('#drawer').hidden) throw new Error('khong mo'); if (d.querySelectorAll('.trace li').length < 5) throw new Error('it buoc'); click('[data-act="close"]'); });
  T('tab luu do', () => { click('[data-act="ptab"][data-v="flow"]'); if (!q('.flow .fl')) throw new Error('trong'); click('[data-act="ptab"][data-v="cfg"]'); });
  T('them buoc', () => { const n = d.querySelectorAll('#rail .step').length; click('[data-act="addstep"]'); if (d.querySelectorAll('#rail .step').length !== n + 1) throw new Error('khong them'); });
  T('lien thong o BC thong minh', () => { click('[data-act="back"]'); click('tr[data-pid="bc-tm-crck2"]'); click('[data-act="step"][data-i="1"]'); if (!q('#sec-lt')) throw new Error('khong co muc'); click('[data-act="addlt"]'); });
  T('can sua -> mo dung buoc', () => { click('[data-act="back"]'); click('.alert [data-act="open"]'); if (!/Văn thư đi_BHCK/.test(q('#crumb').textContent)) throw new Error(q('#crumb').textContent); if (!/Cấp số/.test(q('#editor h2').textContent)) throw new Error(q('#editor h2').textContent); });
  T('them quy trinh: link sai bao loi', () => { click('[data-act="back"]'); click('[data-act="wizard"]'); q('#wz-link').value = 'abc'; click('[data-act="wzread"]'); if (!/Không thấy mã dịch vụ/.test(q('#drawer-panel').textContent)) throw new Error('khong bao'); });
  T('them quy trinh: doc link dung', () => { q('#wz-link').value = 'https://service.base.vn/services/50316'; click('[data-act="wzread"]'); });
});
later(3000, () => {
  T('buoc 2 hien 10 khoi webhook', () => { const n = d.querySelectorAll('.wzh').length; if (n !== 10) throw new Error('ra ' + n); click('[data-act="wznext"]'); });
  T('tao quy trinh tu Base', () => { click('[data-act="wzcreate"]'); if (!/Văn thư BHVN/.test(q('#crumb').textContent)) throw new Error(q('#crumb').textContent); const n = q('#rail .rail-h').textContent; if (n !== '10 bước') throw new Error('rail ' + n); });
  T('buoc chep co nhan Can kiem', () => { if (!/Cần kiểm/.test(q('#rail').textContent)) throw new Error('khong co nhan'); click('[data-act="reviewed"]'); });
  T('luu do BHVN co 10 webhook', () => { click('[data-act="ptab"][data-v="flow"]'); const n = d.querySelectorAll('#view .fl.hook').length; if (n !== 10) throw new Error('ra ' + n); click(q('.fl.hook [data-act="flowgo"]')); if (!q('#editor')) throw new Error('khong ve cau hinh'); });
  w.location.hash = 'tu-dien';
});
later(3600, () => {
  T('tu dien: moi tab va chon muc', () => { if (!q('#deditor')) throw new Error('khong co'); ['noidung', 'thumuc', 'truong', 'office', 'ai', 'file', 'ten'].forEach(k => { click('[data-act="dtab"][data-v="' + k + '"]'); const rows = d.querySelectorAll('tr[data-act="dsel"]'); click(rows[1] || rows[0]); }); });
  T('tu dien: sua mau ten cap nhat xem truoc', () => { click('[data-act="dtab"][data-v="ten"]'); input(q('#d-v'), 'ABC {so_hieu}'); if (!/2916/.test(q('#dpv').textContent)) throw new Error('khong cap nhat'); });
  T('tu dien: them roi xoa', () => { const n = d.querySelectorAll('tr[data-act="dsel"]').length; click('[data-act="dadd"]'); click('[data-act="ddel"]'); if (d.querySelectorAll('tr[data-act="dsel"]').length !== n) throw new Error('so muc lech'); });
  w.location.hash = 'nhat-ky';
});
later(4200, () => {
  T('nhat ky: loc loi + mo chi tiet + mo buoc', () => { click('[data-act="lf"][data-v="Lỗi"]'); if (d.querySelectorAll('.logrow').length !== 1) throw new Error('loc'); click('.logrow'); if (q('#drawer').hidden) throw new Error('khong mo'); click('#drawer-panel [data-act="open"]'); if (!q('#editor')) throw new Error('khong mo buoc'); });
  T('xuat ban xoa ban nhap', () => { click('#publish'); if (!/Không có thay đổi/.test(q('#draft-pill').textContent)) throw new Error(q('#draft-pill').textContent); });
  T('doi giao dien', () => { click('[data-act="theme"]'); if (!d.documentElement.dataset.theme) throw new Error('khong doi'); });
  console.log(errs.length ? '\nLOI: ' + errs.join(' | ') : '\nTAT CA DEU CHAY, KHONG CO LOI');
});
