const fs = require('fs'); const { JSDOM } = require('jsdom');
const html = fs.readFileSync(__dirname + '/../index.html', 'utf8');
const dom = new JSDOM('<!doctype html><html><head></head><body>' + html + '</body></html>', { runScripts: 'dangerously', url: 'https://x.test/#quy-trinh', pretendToBeVisual: true,
  beforeParse(win){ win.TextEncoder = require('util').TextEncoder; win.matchMedia = () => ({ matches: false }); } });
const w = dom.window, d = w.document; const errs = [];
w.addEventListener('error', e => errs.push('ERR ' + e.message));
w.scrollTo = () => {}; w.HTMLElement.prototype.scrollIntoView = function () {};
const q = s => d.querySelector(s), qa = s => Array.from(d.querySelectorAll(s));
const click = sel => { const el = typeof sel === 'string' ? q(sel) : sel; if (!el) throw new Error('khong thay ' + sel); el.dispatchEvent(new w.MouseEvent('click', { bubbles: true })); };
const change = (el, v) => { if (!el) throw new Error('khong thay phan tu'); if (typeof v === 'boolean') el.checked = v; else el.value = v; el.dispatchEvent(new w.Event('change', { bubbles: true })); };
const T = (name, fn) => { try { fn(); console.log('OK   ' + name); } catch (e) { console.log('FAIL ' + name + ' -> ' + e.message); errs.push(name); } };
const stepByName = re => qa('#rail .step').find(b => re.test(b.textContent));

setTimeout(() => {
  T('them quy trinh: man 2 hien dich cu + so truong', () => {
    click('[data-act="wizard"]'); click('[data-act="wzread"]');
  });
}, 50);
setTimeout(() => {
  T('man 2: thong bao 10 khoi gui ve Apps Script cu', () => { if (!/10\/10 khối webhook đang gửi về Apps Script cũ/.test(q('#drawer-panel').textContent)) throw new Error('khong thay'); });
  T('man 2: 50329 nhan 16 truong sau buoc 2.1', () => { const li = qa('.wzh').find(l => /50329/.test(l.textContent)); if (!li || !/Sau: 2.1_VT ĐẾN_Xử lý văn thư đến/.test(li.textContent) || !/16 trường nhập/.test(li.textContent)) throw new Error(li ? li.textContent : 'khong co dong'); });
  T('man 3 co o tu dien truong (mac dinh bat)', () => { click('[data-act="wznext"]'); if (!q('#wz-auto') || !q('#wz-auto').checked) throw new Error('khong co/khong bat'); });
  T('tao quy trinh', () => { click('[data-act="wzcreate"]'); if (!/Văn thư BHVN/.test(q('#crumb').textContent)) throw new Error(q('#crumb').textContent); });
  T('buoc 50329 da tu dien 16 truong', () => { click(stepByName(/50329/)); const n = qa('#fchips .fchip').length; if (n !== 16) throw new Error('so truong ' + n); });
  T('dau buoc hien "Gui ve Apps Script cu"', () => { if (!/Gửi về Apps Script cũ/.test(q('#editor .ed-h').textContent)) throw new Error('khong thay'); });
  T('goi y Base: bo 2 truong roi dung lai 16', () => {
    click(q('#fchips [data-act="rmfield"]')); click(q('#fchips [data-act="rmfield"]'));
    if (qa('#fchips .fchip').length !== 14) throw new Error('chua bo');
    click('[data-act="capoff"][data-k="truong"]'); change(q('#cap-truong'), true);
    if (!/Còn 2 trường chưa chọn/.test(q('#sec-truong').textContent)) throw new Error('khong bao thieu: ' + q('#sec-truong .note').textContent);
    click('[data-act="basefields"]'); if (qa('#fchips .fchip').length !== 16) throw new Error('khong ve 16');
  });
  T('bo chon truong hien lua chon lay tu Base', () => { click('[data-act="picker"]'); if (!/Lựa chọn: Văn thư đến · Văn thư đi · Xin giữ số · Chèn số \/ Bù số/.test(q('#picklist').textContent)) throw new Error('khong thay lua chon'); click('[data-act="picker"]'); });
  T('chay thu canh bao dich cu', () => { click('[data-act="dry"]'); const first = q('.trace li'); if (!first || !/Apps Script cũ/.test(first.textContent)) throw new Error('khong canh bao'); click('[data-act="close"]'); });
  T('luu do: 10/10 khoi con gui ve cu', () => { click('[data-act="ptab"][data-v="flow"]'); if (!/10\/10 khối webhook còn gửi về Apps Script cũ/.test(q('#view').textContent)) throw new Error('khong thay'); if (qa('.fl.hook .pill.warn').length !== 10) throw new Error('nhan ' + qa('.fl.hook .pill.warn').length); });
  T('huong dan chuyen: danh dau 3 khoi -> con 7', () => {
    click('[data-act="migrate"]'); if (!q('#mig-url') || !/a\.run\.app/.test(q('#mig-url').value)) throw new Error('khong co dia chi moi');
    qa('[data-mig]').slice(0, 3).forEach(cb => { cb.checked = true; });
    click('[data-act="migcheck"]');
    if (!/7\/10 khối webhook còn gửi về Apps Script cũ/.test(q('#view').textContent)) throw new Error('banner: ' + (q('.note') || {}).textContent);
    if (qa('.fl.hook .pill.ok').length !== 3) throw new Error('nhan moi ' + qa('.fl.hook .pill.ok').length);
  });
  T('nut chep dia chi khong loi', () => { click('[data-act="migrate"]'); click('[data-act="copyurl"]'); click('[data-act="close"]'); });
  T('Nhap vat tu: da chuyen het', () => { click('[data-act="back"]'); click('tr[data-pid="kho-nhap-vt"]'); click('[data-act="ptab"][data-v="flow"]'); if (!/khối webhook đã gửi về hệ thống mới/.test(q('#view').textContent)) throw new Error('khong thay'); click('[data-act="ptab"][data-v="cfg"]'); });
  T('xoa buoc: hoi lai, huy, roi xoa that', () => {
    const n = qa('#rail .step').length; click('[data-act="step"][data-i="2"]');
    click('[data-act="askdelstep"]'); if (!q('[data-act="delstep"]')) throw new Error('khong hoi lai');
    click('[data-act="nocancel"]'); if (qa('#rail .step').length !== n) throw new Error('huy ma van xoa');
    click('[data-act="askdelstep"]'); click('[data-act="delstep"]'); if (qa('#rail .step').length !== n - 1) throw new Error('khong xoa');
  });
  T('nhan ban quy trinh', () => { click('[data-act="dupproc"]'); if (!/bản sao/.test(q('#crumb').textContent)) throw new Error(q('#crumb').textContent); });
  T('xoa quy trinh ban sao', () => { click('[data-act="askdelproc"]'); click('[data-act="delproc"]'); if (q('tr[data-pid*="kho-nhap-vt-"]')) throw new Error('van con'); });
  T('luu ban nhap tren trinh duyet', () => { const raw = w.localStorage.getItem('base-dieu-khien-mau-v3'); if (!raw) throw new Error('chua luu'); const dd = JSON.parse(raw); if (!dd.dirty.length) throw new Error('khong co thay doi'); if (!JSON.parse(dd.snap).P.some(p => p.name === 'Văn thư BHVN')) throw new Error('khong co quy trinh moi'); });
  T('xuat ban -> phien ban 2', () => { click('#publish'); click('[data-act="history"]'); if (!/Phiên bản 2/.test(q('#drawer-panel').textContent) || !/Phiên bản 1/.test(q('#drawer-panel').textContent)) throw new Error('lich su'); });
  T('khoi phuc phien ban 1 bo quy trinh moi', () => { click('[data-act="restore"][data-n="1"]'); if (P_has(/Văn thư BHVN/)) throw new Error('van con quy trinh moi'); if (!/thay đổi chưa xuất bản/.test(q('#draft-pill').textContent)) throw new Error('khong vao ban nhap'); });
  T('dat lai du lieu mau (bam 2 lan)', () => {
    click('[data-act="reset"]'); if (!/Bấm lần nữa/.test(q('#reset-btn').textContent)) throw new Error('khong hoi lai');
    click('[data-act="reset"]'); if (qa('#ptbody tr.row').length !== 15) throw new Error('so quy trinh ' + qa('#ptbody tr.row').length);
    if (!/Không có thay đổi/.test(q('#draft-pill').textContent)) throw new Error('van con thay doi');
  });
  console.log(errs.length ? '\nLOI: ' + errs.join(' | ') : '\nTAT CA DEU CHAY, KHONG CO LOI');
}, 1500);
function P_has(re){ w.location.hash = 'quy-trinh'; click('[data-act="grp"][data-v="Tất cả"]'); return qa('#ptbody tr.row').some(r => re.test(r.textContent)); }
