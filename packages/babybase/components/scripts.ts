import { raw } from "hono/html";

const KEYWORDS = new Set([
  "ABORT","ACTION","ADD","AFTER","ALL","ALTER","ALWAYS","ANALYZE","AND","AS",
  "ASC","ATTACH","AUTOINCREMENT","BEFORE","BEGIN","BETWEEN","BY","CASCADE",
  "CASE","CAST","CHECK","COLLATE","COLUMN","COMMIT","CONFLICT","CONSTRAINT",
  "CREATE","CROSS","CURRENT","CURRENT_DATE","CURRENT_TIME","CURRENT_TIMESTAMP",
  "DATABASE","DEFAULT","DEFERRED","DEFERRABLE","DELETE","DESC","DETACH","DISTINCT",
  "DO","DROP","EACH","ELSE","END","ESCAPE","EXCEPT","EXCLUDE","EXCLUSIVE","EXISTS",
  "EXPLAIN","FAIL","FILTER","FIRST","FOLLOWING","FOR","FOREIGN","FROM","FULL",
  "GENERATED","GLOB","GROUP","GROUPS","HAVING","IF","IGNORE","IMMEDIATE","IN",
  "INDEX","INDEXED","INITIALLY","INNER","INSERT","INSTEAD","INTERSECT","INTO",
  "IS","ISNULL","JOIN","KEY","LAST","LEFT","LIKE","LIMIT","MATCH","MATERIALIZED",
  "NATURAL","NO","NOT","NOTHING","NOTNULL","NULL","NULLS","OF","OFFSET","ON","OR",
  "ORDER","OTHERS","OUTER","OVER","PARTITION","PLAN","PRAGMA","PRECEDING","PRIMARY",
  "QUERY","RAISE","RANGE","RECURSIVE","REFERENCES","REGEXP","REINDEX","RELEASE",
  "RENAME","REPLACE","RESTRICT","RETURNING","RIGHT","ROLLBACK","ROW","ROWS",
  "SAVEPOINT","SELECT","SET","STATEMENT","TABLE","TEMP","TEMPORARY","THEN","TIES",
  "TO","TRANSACTION","TRIGGER","UNBOUNDED","UNION","UNIQUE","UPDATE","USING",
  "VACUUM","VALUES","VIEW","VIRTUAL","WHEN","WHERE","WINDOW","WITH","WITHOUT",
  "BLOB","BOOLEAN","CHAR","DATE","DATETIME","DOUBLE","FLOAT","INT","INTEGER",
  "NUMERIC","REAL","TEXT","TIMESTAMP","VARCHAR",
]);

const TOKEN = new RegExp(
  [
    String.raw`('(?:[^'\\]|''|\\.)*')`,
    String.raw`("(?:[^"\\]|\\.)*")`,
    `(\`${"(?:[^"}\`${String.raw`\\]|\\.)*`}\`)`,
    String.raw`(\[(?:[^\]\\]|\\.)*\])`,
    String.raw`(--[^\n]*)`,
    String.raw`(\/\*[\s\S]*?\*\/)`,
    String.raw`((?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?)`,
    `([A-Za-z_][A-Za-z0-9_]*)`,
    `([ \t\n\r]+)`,
    `(.)`,
  ].join("|"),
  "g",
);

export function highlightSql(sql: string) {
  let out = "";
  TOKEN.lastIndex = 0;
  let m = TOKEN.exec(sql);
  while (m !== null) {
    const [, sq, dq, bq, br, lc, bc, num, word, ws, other] = m;
    if (sq)          out += `<span class="sql-string">${sq}</span>`;
    else if (dq || bq || br) out += `<span class="sql-string">${m[0]}</span>`;
    else if (lc || bc)       out += `<span class="sql-comment">${m[0]}</span>`;
    else if (num)    out += `<span class="sql-number">${num}</span>`;
    else if (word)   out += KEYWORDS.has(word.toUpperCase()) ? `<span class="sql-keyword">${word}</span>` : word;
    else if (ws)     out += ws;
    else if (other)  out += other;
    m = TOKEN.exec(sql);
  }
  return raw(out);
}

export const uploadZoneScript = `(function () {
  var zone = document.getElementById("upload-zone");
  var input = document.getElementById("upload-input");
  if (!zone || !input) return;
  var url = zone.dataset.uploadUrl;

  function dispatch(name, detail) {
    zone.dispatchEvent(new CustomEvent(name, { bubbles: true, detail: detail }));
  }

  function validate(file) {
    var accept = input.accept;
    if (!accept) return true;
    var exts = accept.split(",").map(function (s) { return s.trim().replace(/^\\./, "").toLowerCase(); });
    var ext = file.name.split(".").pop().toLowerCase();
    return exts.indexOf(ext) !== -1;
  }

  function doUpload(file) {
    if (!validate(file)) {
      dispatch("upload-zone:error", { message: "Invalid file type. Accepted: " + input.accept });
      return;
    }
    var fd = new FormData();
    fd.append("file", file);
    zone.classList.add("uploading");
    fetch(url, { method: "POST", body: fd })
      .then(function (r) {
        if (r.ok) {
          dispatch("upload-zone:success", { file: file, response: r });
        } else {
          dispatch("upload-zone:error", { message: "Upload failed (" + r.status + ")" });
        }
      })
      .catch(function () {
        dispatch("upload-zone:error", { message: "Upload failed" });
      })
      .finally(function () {
        zone.classList.remove("uploading");
      });
  }

  zone.addEventListener("dragover", function (e) {
    e.preventDefault();
    zone.classList.add("drag-over");
  });
  zone.addEventListener("dragleave", function () {
    zone.classList.remove("drag-over");
  });
  zone.addEventListener("drop", function (e) {
    e.preventDefault();
    zone.classList.remove("drag-over");
    var file = e.dataTransfer && e.dataTransfer.files[0];
    if (file) doUpload(file);
  });
  input.addEventListener("change", function () {
    if (input.files && input.files[0]) doUpload(input.files[0]);
    input.value = "";
  });
})();`;

export const tableTabsScript = `(function () {
  var nav = document.querySelector(".table-tabs");
  var wrap = nav && nav.parentElement;
  if (!nav || !wrap) return;
  function update() {
    var sl = nav.scrollLeft;
    var max = nav.scrollWidth - nav.clientWidth;
    wrap.classList.toggle("fade-left", sl > 2);
    wrap.classList.toggle("fade-right", max > 2 && sl < max - 2);
  }
  nav.addEventListener("scroll", update);
  setTimeout(update, 50);
  window.addEventListener("popstate", function () {
    location.reload();
  });
})();`;
