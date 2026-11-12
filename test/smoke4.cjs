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
const card = id => qa('.wzh').find(c => c.querySelector('[data-id="' + id + '"]'));
const P = () => { const v = d.createElement('script'); v.textContent = 'window.__P = P;'; d.body.appendChild(v); return w.__P; };

setTimeout(() => {
  T('mo trinh: buoc 1 co 5 dich vu thu', () => { click('[data-act="wizard"]'); if (qa('[data-act="wztry"]').length !== 5) throw new Error(qa('[data-act="wztry"]').length); });
  T('link khong co mau -> bao loi', () => { q('#wz-link').value = 'https://service.base.vn/services/12345'; click('[data-act="wzread"]'); if (!/chưa có lưu đồ của dịch vụ 12345/.test(q('#drawer-panel').textContent)) throw new Error('khong bao'); });
  T('link sai -> bao loi', () => { q('#wz-link').value = 'abc'; click('[data-act="wzread"]'); if (!/Không thấy mã dịch vụ/.test(q('#drawer-panel').textContent)) throw new Error('khong bao'); });
  T('bam dich vu kho 50986', () => { click('[data-act="wztry"][data-v="50986"]'); if (!/Đang đọc từ Base/.test(q('#drawer-panel').textContent)) throw new Error('khong loading'); });
}, 50);
setTimeout(() => {
  T('buoc 2: 45 the webhook, drawer rong', () => { if (qa('.wzh').length !== 45) throw new Error(qa('.wzh').length); if (!q('#drawer-panel').classList.contains('wide')) throw new Error('khong wide'); });
  T('nhom theo nhanh', () => { const hs = qa('.wzgrp h3').map(x => x.textContent); if (!hs.some(t => /^Vật tư/.test(t))) throw new Error(hs.join('|')); });
  T('51151: sau 2.1, 7 truong 1 file, goi y Du lieu + File', () => {
    const c = card(51151); if (!/Sau: 2\.1 Đề xuất nhập kho vật tư/.test(c.textContent)) throw new Error(c.textContent.slice(0, 200));
    if (!/7 trường nhập ở bước này, 1 file/.test(c.textContent)) throw new Error('so truong');
    const on = Array.from(c.querySelectorAll('[data-act="wzcap"][aria-pressed="true"]')).map(b => b.dataset.k).join(',');
    if (on !== 'truong,file') throw new Error(on);
  });
  T('mo danh sach truong', () => { click(card(51151).querySelector('[data-act="wzfields"]')); if (card(51151).querySelectorAll('.fpill').length !== 7) throw new Error('fpill'); if (!card(51151).querySelector('.fpill.file')) throw new Error('khong danh dau file'); });
  T('canh bao du lieu rut gon + nhieu ban Apps Script', () => { const t = q('#drawer-panel').textContent; if (!/compact/.test(t) || !/2 bản Apps Script/.test(t)) throw new Error('thieu canh bao'); if (!card(51152).querySelector('.pill.warn')) throw new Error('the khong co nhan'); });
  T('bat AI cho 51151', () => { click(card(51151).querySelector('[data-k="ai"]')); if (card(51151).querySelector('[data-k="ai"]').getAttribute('aria-pressed') !== 'true') throw new Error('chua bat'); if (!/Lấy file từ/.test(card(51151).textContent)) throw new Error('khong hien nguon file'); });
  T('bo chon 51149', () => { change(card(51149).querySelector('[data-wz="inc"]'), false); if (!card(51149).classList.contains('off')) throw new Error('khong off'); if (!/Tiếp tục với 44 webhook/.test(q('#drawer-panel').textContent)) throw new Error('nut'); });
  T('so do hien ngay: 45 o webhook, 51149 vien dut, 51151 co the AI', () => {
    const hk = qa('.fc-wrap .fc-node.fc-hook'); if (hk.length !== 45) throw new Error('so o ' + hk.length);
    if (qa('.fc-wrap .fc-node').length < 100) throw new Error('it o ' + qa('.fc-wrap .fc-node').length);
    const o = hk.find(x => x.dataset.id === '51149'); if (!o.classList.contains('off')) throw new Error('51149 khong off');
    const a = hk.find(x => x.dataset.id === '51151'); if (!/AI/.test(a.textContent)) throw new Error('khong co the AI');
    if (qa('.fc-wrap .fc-bl').length < 8) throw new Error('nhanh ' + qa('.fc-wrap .fc-bl').length);
  });
  T('bam o webhook -> nhay toi the', () => { click('.fc-node.fc-hook[data-id="51153"]'); if (!d.getElementById('wzh-51153').classList.contains('flash')) throw new Error('khong flash'); });
  T('phong to + an so do', () => { click('[data-act="wzbig"]'); if (!q('#drawer-panel').classList.contains('full')) throw new Error('khong full'); click('[data-act="wzbig"]'); click('[data-act="wztree"]'); if (q('.fc-wrap')) throw new Error('chua an'); click('[data-act="wztree"]'); });
  T('bo chon tat ca -> nut tiep tuc khoa', () => { click('[data-act="wzall"][data-v="0"]'); if (!q('[data-act="wznext"]').disabled) throw new Error('khong khoa'); click('[data-act="wzall"][data-v="1"]'); change(card(51149).querySelector('[data-wz="inc"]'), false); });
  T('buoc 3: ten/nhom/bang mac dinh + tong ket', () => {
    click('[data-act="wznext"]');
    if (q('#wz-group').value !== 'Kho') throw new Error('nhom ' + q('#wz-group').value);
    if (!/Sẽ tạo 44 bước, bỏ qua 1 khối/.test(q('#drawer-panel').textContent)) throw new Error('tong ket');
    if (!/AI: 1/.test(q('#drawer-panel').textContent)) throw new Error('dem AI');
  });
  T('tao ban nhap', () => {
    q('#wz-name').value = 'Xuất nhập kho BHCK (thử)'; click('[data-act="wzcreate"]');
    if (!/Xuất nhập kho BHCK \(thử\)/.test(q('#crumb').textContent)) throw new Error('crumb ' + q('#crumb').textContent);
    const steps = qa('#rail .step'); if (q('#rail .rail-h').textContent !== '44 bước') throw new Error('so buoc ' + q('#rail .rail-h').textContent);
    if (steps.some(b => /51149/.test(b.textContent))) throw new Error('van co 51149');
    if (q('#f-on') && q('#f-on').checked) throw new Error('dang bat');
    click(steps.find(b => /51151/.test(b.textContent)));
    if (!q('#cap-ai').checked || !q('#cap-file').checked || !q('#cap-truong').checked) throw new Error('caps');
    if (qa('#fchips .fchip').length !== 7) throw new Error('truong ' + qa('#fchips .fchip').length);
  });
  T('so do: bam webhook da cau hinh -> mo cau hinh ben phai, doi viec -> o so do cap nhat', () => {
    click('[data-act="ptab"][data-v="flow"]');
    if (qa('#fcd .fc-hook').length !== 45) throw new Error('so o ' + qa('#fcd .fc-hook').length);
    click('#fcd .fc-hook[data-id="51153"]');
    if (!q('#fpanel #editor') || !/51153/.test(q('#fpanel #editor').textContent)) throw new Error('khong mo cau hinh');
    if (!q('#fcd .fc-hook[data-id="51153"]').classList.contains('cur')) throw new Error('khong danh dau dang chon');
    change(q('#fpanel #cap-ai'), true);
    if (!/AI/.test(q('#fcd .fc-hook[data-id="51153"] .fc-tags').textContent)) throw new Error('o so do khong cap nhat');
  });
  T('so do: bam webhook chua cau hinh -> them vao cau hinh', () => {
    click('#fcd .fc-hook[data-id="51149"]');
    if (!/chưa có trong cấu hình/.test(q('#fpanel').textContent)) throw new Error('khong bao chua cau hinh');
    if (!/1\. Hình thức xuất nhập/.test(q('#fpanel').textContent)) throw new Error('khong hien khoi truoc');
    click('#fpanel [data-act="flowadd"]');
    if (!q('#fpanel #editor') || q('#fcd .fc-hook[data-id="51149"]').classList.contains('off')) throw new Error('chua them');
  });
  T('so do: bam khoi duyet -> hien thong tin', () => {
    click('#fcd .fc-appr');
    if (!/Khối duyệt trên Base/.test(q('#fpanel').textContent)) throw new Error('khong hien thong tin');
  });
  T('doi chieu Base: 1 khoi chua cau hinh', () => { click('[data-act="ptab"][data-v="flow"]'); click('[data-act="reread"]'); if (!/khớp, không có khối mới/.test(d.body.textContent)) throw new Error('toast'); });
  T('van thu BHVN: chep cau hinh BHCK', () => {
    click('[data-act="back"]'); click('[data-act="wizard"]'); click('[data-act="wztry"][data-v="50316"]');
  });
  setTimeout(() => {
  T('BHVN: 10 the, canh bao dieu kien ghep', () => { if (qa('.wzh').length !== 10) throw new Error(qa('.wzh').length); if (!/ghép 2 điều kiện/.test(q('#drawer-panel').textContent)) throw new Error('canh bao'); click('[data-act="wznext"]'); if (!q('#wz-copy') || q('#wz-copy').value !== 'vt') throw new Error('copy'); click('[data-act="wzcreate"]'); if (q('#rail .rail-h').textContent !== '10 bước') throw new Error('so buoc ' + q('#rail .rail-h').textContent); if (!/Đã chép cấu hình/.test(q('#view').textContent)) throw new Error('khong chep'); });
  console.log(errs.length ? '\nLOI: ' + errs.join(' | ') : '\nTAT CA OK');
  process.exit(errs.length ? 1 : 0);
  }, 1200);
}, 1000);
