// Sinh dữ liệu mẫu SAMPLES (lưu đồ đọc từ Base) cho index.html, dùng đúng module của backend.
//   node tools/gen-samples.mjs <thư mục chứa services.json + stages_<id>.json> <đường dẫn base-backend/src/base/flow.js> [id1,id2,...]
// Kết quả ghi ra samples.json; thay vào dòng "const SAMPLES = ...;" trong index.html.
// services.json = phản hồi service/get.all; stages_<id>.json = phản hồi service/get.stages của từng dịch vụ.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const [dataDir, flowPath, idsArg] = process.argv.slice(2);
if (!dataDir || !flowPath) {
  console.error("Cách dùng: node tools/gen-samples.mjs <thư mục dữ liệu Base> <flow.js> [50316,43945,...]");
  process.exit(1);
}
const { analyzeFlow } = await import(pathToFileURL(path.resolve(flowPath)).href);
const services = JSON.parse(fs.readFileSync(path.join(dataDir, "services.json"), "utf8")).services;
const IDS = (idsArg || "50316,33975,43945,13681,50986").split(",");
const out = {};
for (const id of IDS) {
  const st = JSON.parse(fs.readFileSync(path.join(dataDir, "stages_" + id + ".json"), "utf8")).stages;
  const f = analyzeFlow(services.find((s) => String(s.id) === id), st, {});
  const used = new Set(f.hooks.flatMap((h) => h.fields));
  const fieldName = {};
  for (const fl of f.fields) if (used.has(fl.id)) fieldName[fl.id] = fl.name;
  out[id] = {
    svc: f.svc, name: f.name, blocks: f.blocks, fields: f.fieldCount, counts: f.counts, first: f.firstBlockId,
    warn: f.warnings,
    tree: f.tree.map((x) => { const o = { t: x.t, n: x.n, d: x.d }; if (x.id) o.id = x.id; if (x.br) o.br = x.br; if (x.warn) o.warn = 1; if (x.par) o.par = 1; return o; }),
    hooks: f.hooks.map((h) => ({ id: h.id, n: h.name, br: h.branch, from: h.from, via: h.via, f: h.fields, ff: h.fileFields, ep: h.endpoint, epl: h.endpointLabel, data: h.data, sg: h.suggest, cs: h.cases || [] })),
    fn: fieldName,
    // chỗ rẽ nhánh để tách thành nhiều quy trình (xem base-backend/src/base/split.js)
    split: { switches: (f.split ? f.split.switches : []).map((s) => ({ id: s.id, name: s.name, tang: s.tang, tach_duoc: s.tach_duoc, trong_nhanh: s.trong_nhanh, cases: s.cases.map((c) => ({ id: c.id, name: c.name, mac_dinh: c.mac_dinh, cond: c.cond.map((g) => g.map((x) => ({ field: x.field, fieldName: x.fieldName, op: x.op, v: x.v }))) })) })) },
  };
  console.log(id, f.name, "webhook", f.hooks.length, "khối trên sơ đồ", f.tree.length);
}
const json = JSON.stringify(out);
if (/access_token|script\.google\.com|office\.base\.vn\/webhook/.test(json)) throw new Error("Dữ liệu có URL/khoá bí mật — dừng");
fs.writeFileSync("samples.json", json);
console.log("Đã ghi samples.json (" + Buffer.byteLength(json) + " byte)");
