// Tách 1 dịch vụ thành nhiều quy trình: kho 50986 -> 2 / 6, văn thư 33975 -> 2 (gộp Xin giữ số), báo cáo 43945 -> không tách.
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
const chips = () => qa('[data-act="wzlv"]').map(b => b.textContent.replace(/\s+/g, ' ').trim());
const rows = () => qa('.wzsplit tbody tr');
const open = (svc) => { click('[data-act="wizard"]'); click('[data-act="wztry"][data-v="' + svc + '"]'); };

setTimeout(() => open(50986), 30);
setTimeout(() => {
  T('kho: tự thấy 3 mức tách 1 / 2 / 6', () => {
    const c = chips();
    if (c.length !== 3) throw new Error(c.join(' | '));
    if (!/^Không tách · 1$/.test(c[0]) || !/Tách theo «1‘ Lựa chọn hình thức xuất nhập» · 2$/.test(c[1]) || !/Tách thêm theo «2\. Lựa chọn loại hàng hóa» · 6$/.test(c[2])) throw new Error(c.join(' | '));
    if (!/tối đa 6 quy trình/.test(q('.wzsplit').textContent)) throw new Error('khong goi y');
  });
  T('chọn mức 2: 6 quy trình, tên theo nhánh + đơn vị, điều kiện nhận phiếu', () => {
    click('[data-act="wzlv"][data-v="2"]');
    if (rows().length !== 6) throw new Error(rows().length);
    const names = qa('[data-wzg="ten"]').map(i => i.value);
    if (names[0] !== 'Nhập kho – Vật tư_BH' || names[5] !== 'Xuất kho – Mủ cao su thành phẩm_BH') throw new Error(names.join('|'));
    if (!/Hình thức = "Nhập kho" và Loại hàng hóa = "Vật tư"|= "Nhập kho" và .*= "Vật tư"/.test(rows()[0].textContent)) throw new Error(rows()[0].textContent);
    if (!/7 riêng\+ 2 chung|7 riêng.*2 chung/.test(rows()[0].textContent)) throw new Error('so webhook ' + rows()[0].textContent);
    if (!/3 webhook dùng chung/.test(q('.wzsplit').textContent)) throw new Error('khong giai thich webhook chung');
  });
  T('thẻ webhook nhóm theo quy trình, khối dùng chung riêng một nhóm; sơ đồ tô màu', () => {
    const hs = qa('.wzgrp h3').map(h => h.textContent);
    if (!/^Dùng chung cho nhiều quy trình · 3 khối/.test(hs[0])) throw new Error(hs.join('|'));
    if (hs.length !== 7) throw new Error('so nhom ' + hs.length);
    const nodes = qa('.fc-wrap .fc-hook');
    if (!nodes.every(n => /box-shadow/.test(n.getAttribute('style') || ''))) throw new Error('o chua to mau');
    if (qa('.fc-wrap .fc-hook[data-chung]').length !== 3) throw new Error('o chung ' + qa('.fc-wrap .fc-hook[data-chung]').length);
  });
  T('đổi tên, bỏ 1 quy trình, tự chọn chỗ tách', () => {
    change(qa('[data-wzg="ten"]')[0], 'Nhập vật tư_BHCK');
    if (!/Trùng tên quy trình đã có/.test(rows()[0].textContent)) throw new Error('khong canh bao trung ten');
    change(qa('[data-wzg="ten"]')[0], 'Nhập vật tư_BHCK (tách)');
    change(qa('[data-wzg="bo"]')[5], true);
    click('[data-act="wztuchon"]');
    if (qa('[data-wzsw]').length !== 3) throw new Error('so cho tach ' + qa('[data-wzsw]').length);
  });
  T('bước 3 + tạo: 5 quy trình nháp, mỗi quy trình có nhánh và điều kiện', () => {
    click('[data-act="wznext"]');
    if (!/Sẽ tạo 5 quy trình/.test(q('#drawer-panel').textContent)) throw new Error(q('#drawer-panel').textContent.slice(0, 300));
    change(qa('[data-wzg="bang"]')[0], 'XUAT_NHAP_KHO_BHCK');
    click('[data-act="wzcreate"]');
    const t = q('#view').textContent;
    if (!t.includes('Nhập vật tư_BHCK (tách)') || !/Xuất kho – Mủ cao su nguyên liệu_BH/.test(t)) throw new Error('khong thay quy trinh moi');
    if (/Xuất kho – Mủ cao su thành phẩm_BH/.test(t)) throw new Error('quy trinh da bo van tao');
  });
  T('mở quy trình vừa tạo: nhãn nhánh + điều kiện, bước dùng chung', () => {
    click(qa('#ptbody [data-act="open"]').find(x => x.textContent.includes('Nhập vật tư_BHCK (tách)')));
    const t = q('#view').textContent;
    if (!/Nhánh: Nhập kho – Vật tư/.test(t)) throw new Error('khong co nhan nhanh: ' + t.slice(0, 400));
    if (!/Nhận phiếu khi: .*Nhập kho.*Vật tư/.test(t)) throw new Error('khong co dieu kien');
    if (!/Lưu vào bảng: XUAT_NHAP_KHO_BHCK/.test(t)) throw new Error('bang');
    if (qa('#rail [data-act="step"][data-i]').length !== 9) throw new Error('so buoc ' + qa('#rail [data-act="step"][data-i]').length);
  });
  click('[data-act="back"]');
  open(33975);
}, 1000);
setTimeout(() => {
  T('văn thư 33975: tách 2 (đến / đi), "Xin giữ số" gộp vào Văn thư đi', () => {
    const c = chips(); if (c.length !== 2 || !/· 2$/.test(c[1])) throw new Error(c.join(' | ') + ' / ' + (q('.wzsplit') ? q('.wzsplit').textContent : q('#drawer-panel').textContent).slice(0, 300));
    click('[data-act="wzlv"][data-v="1"]');
    const names = qa('[data-wzg="ten"]').map(i => i.value);
    if (names.join('|') !== 'Văn thư đến_ĐẢNG ỦY|Văn thư đi_ĐẢNG ỦY') throw new Error(names.join('|'));
    if (!/gộp Xin giữ số/.test(rows()[1].textContent)) throw new Error(rows()[1].textContent);
    if (!/6 riêng/.test(rows()[1].textContent)) throw new Error('so webhook di');
  });
  click('[data-act="close"]');
  open(43945);
}, 3200);
setTimeout(() => {
  T('báo cáo 43945: không có chỗ tách -> 1 quy trình như cũ', () => {
    if (!/không có chỗ rẽ nhánh nào chia webhook/.test(q('.wzsplit').textContent)) throw new Error(q('.wzsplit').textContent);
    if (qa('[data-act="wzlv"]').length) throw new Error('van hien muc tach');
  });
  console.log(errs.length ? '\nLOI: ' + errs.join(' | ') : '\nTAT CA OK');
  process.exit(errs.length ? 1 : 0);
}, 5000);
