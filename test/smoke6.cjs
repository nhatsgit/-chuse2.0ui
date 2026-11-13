// Nhật ký ghi rõ: tìm theo phiếu, lọc quy trình + đếm theo kết quả, chỗ dừng, cách xử lý, từng bước có thời gian, lượt khác của phiếu.
const fs = require('fs'); const { JSDOM } = require('jsdom');
const html = fs.readFileSync(__dirname + '/../index.html', 'utf8');
const dom = new JSDOM('<!doctype html><html><head></head><body>' + html + '</body></html>', { runScripts: 'dangerously', url: 'https://x.test/#nhat-ky', pretendToBeVisual: true,
  beforeParse(win){ win.TextEncoder = require('util').TextEncoder; win.matchMedia = () => ({ matches: false }); } });
const w = dom.window, d = w.document; const errs = [];
w.addEventListener('error', e => errs.push('ERR ' + e.message));
w.scrollTo = () => {}; w.HTMLElement.prototype.scrollIntoView = function () {};
const q = s => d.querySelector(s), qa = s => Array.from(d.querySelectorAll(s));
const click = sel => { const el = typeof sel === 'string' ? q(sel) : sel; if (!el) throw new Error('khong thay ' + sel); el.dispatchEvent(new w.MouseEvent('click', { bubbles: true })); };
const T = (name, fn) => { try { fn(); console.log('OK   ' + name); } catch (e) { console.log('FAIL ' + name + ' -> ' + e.message); errs.push(name); } };
const rows = () => qa('#logbody .logrow');

setTimeout(() => {
  T('8 lượt, mới nhất lên đầu, dòng có tên bước + thời gian chạy', () => {
    if (rows().length !== 8) throw new Error(rows().length);
    if (!/^09:14:06/.test(rows()[0].textContent)) throw new Error(rows()[0].textContent);
    if (!/giây/.test(rows()[0].querySelector('.t').textContent)) throw new Error('khong co thoi luong');
  });
  T('nút lọc có số đếm', () => { const t = qa('[data-act="lf"]').map(b => b.textContent.replace(/\s+/g, ' ').trim()); if (t.join('|') !== 'Tất cả 8|Lỗi 1|Cảnh báo 3|Thành công 4') throw new Error(t.join('|')); });
  T('dòng lỗi ghi rõ dừng ở bước nào', () => { const r = rows().find(x => /2768390/.test(x.textContent) && /Lỗi/.test(x.textContent)); if (!/Dừng ở bước \d+\/\d+:/.test(r.textContent)) throw new Error(r.textContent); });
  T('tìm theo số phiếu', () => { const i = q('#lq'); i.value = '2768390'; i.dispatchEvent(new w.Event('input', { bubbles: true })); if (rows().length !== 2) throw new Error(rows().length); if (q('#lq').value !== '2768390') throw new Error('mat chu'); });
  T('lọc quy trình + kết quả', () => {
    const i = q('#lq'); i.value = ''; i.dispatchEvent(new w.Event('input', { bubbles: true }));
    const s = q('#lp'); s.value = 'Văn thư đi_BHCK'; s.dispatchEvent(new w.Event('change', { bubbles: true }));
    if (rows().length !== 3) throw new Error(rows().length);
    click('[data-act="lf"][data-v="Cảnh báo"]'); if (rows().length !== 2) throw new Error('canh bao ' + rows().length);
    click('[data-act="lf"][data-v="Tất cả"]');
  });
  T('mở lượt lỗi: chỗ dừng, cách xử lý, bước đánh số + thời gian, chi tiết kỹ thuật, lượt khác của phiếu', () => {
    click(rows().find(x => /Lỗi/.test(x.textContent)));
    const t = q('#drawer-panel').textContent;
    if (!/Dừng ở bước \d+\/\d+ «/.test(t)) throw new Error('khong co cho dung');
    if (!/Cách xử lý:.*Giá trị luồng/.test(t)) throw new Error('khong co goi y');
    if (!/1\. .*· \d+ ms/.test(t)) throw new Error('buoc khong danh so / thoi gian');
    if (!q('#drawer-panel details.tech')) throw new Error('khong co chi tiet ky thuat');
    if (!/Các lượt khác của phiếu 2768390/.test(t)) throw new Error('khong co luot khac');
    click(q('#drawer-panel .logrow'));
    if (!/Base từ chối/.test(q('#drawer-panel').textContent)) throw new Error('khong mo duoc luot khac');
    if (!/Cách xử lý:.*Base từ chối lệnh sửa phiếu/.test(q('#drawer-panel').textContent)) throw new Error('goi y base');
  });
  console.log(errs.length ? '\nLOI: ' + errs.join(' | ') : '\nTAT CA OK');
  process.exit(errs.length ? 1 : 0);
}, 80);
