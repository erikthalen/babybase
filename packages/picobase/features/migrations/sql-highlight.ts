const KEYWORDS = new Set([
  "ABORT",
  "ACTION",
  "ADD",
  "AFTER",
  "ALL",
  "ALTER",
  "ALWAYS",
  "ANALYZE",
  "AND",
  "AS",
  "ASC",
  "ATTACH",
  "AUTOINCREMENT",
  "BEFORE",
  "BEGIN",
  "BETWEEN",
  "BY",
  "CASCADE",
  "CASE",
  "CAST",
  "CHECK",
  "COLLATE",
  "COLUMN",
  "COMMIT",
  "CONFLICT",
  "CONSTRAINT",
  "CREATE",
  "CROSS",
  "CURRENT",
  "CURRENT_DATE",
  "CURRENT_TIME",
  "CURRENT_TIMESTAMP",
  "DATABASE",
  "DEFAULT",
  "DEFERRED",
  "DEFERRABLE",
  "DELETE",
  "DESC",
  "DETACH",
  "DISTINCT",
  "DO",
  "DROP",
  "EACH",
  "ELSE",
  "END",
  "ESCAPE",
  "EXCEPT",
  "EXCLUDE",
  "EXCLUSIVE",
  "EXISTS",
  "EXPLAIN",
  "FAIL",
  "FILTER",
  "FIRST",
  "FOLLOWING",
  "FOR",
  "FOREIGN",
  "FROM",
  "FULL",
  "GENERATED",
  "GLOB",
  "GROUP",
  "GROUPS",
  "HAVING",
  "IF",
  "IGNORE",
  "IMMEDIATE",
  "IN",
  "INDEX",
  "INDEXED",
  "INITIALLY",
  "INNER",
  "INSERT",
  "INSTEAD",
  "INTERSECT",
  "INTO",
  "IS",
  "ISNULL",
  "JOIN",
  "KEY",
  "LAST",
  "LEFT",
  "LIKE",
  "LIMIT",
  "MATCH",
  "MATERIALIZED",
  "NATURAL",
  "NO",
  "NOT",
  "NOTHING",
  "NOTNULL",
  "NULL",
  "NULLS",
  "OF",
  "OFFSET",
  "ON",
  "OR",
  "ORDER",
  "OTHERS",
  "OUTER",
  "OVER",
  "PARTITION",
  "PLAN",
  "PRAGMA",
  "PRECEDING",
  "PRIMARY",
  "QUERY",
  "RAISE",
  "RANGE",
  "RECURSIVE",
  "REFERENCES",
  "REGEXP",
  "REINDEX",
  "RELEASE",
  "RENAME",
  "REPLACE",
  "RESTRICT",
  "RETURNING",
  "RIGHT",
  "ROLLBACK",
  "ROW",
  "ROWS",
  "SAVEPOINT",
  "SELECT",
  "SET",
  "STATEMENT",
  "TABLE",
  "TEMP",
  "TEMPORARY",
  "THEN",
  "TIES",
  "TO",
  "TRANSACTION",
  "TRIGGER",
  "UNBOUNDED",
  "UNION",
  "UNIQUE",
  "UPDATE",
  "USING",
  "VACUUM",
  "VALUES",
  "VIEW",
  "VIRTUAL",
  "WHEN",
  "WHERE",
  "WINDOW",
  "WITH",
  "WITHOUT",
  // Types
  "BLOB",
  "BOOLEAN",
  "CHAR",
  "DATE",
  "DATETIME",
  "DOUBLE",
  "FLOAT",
  "INT",
  "INTEGER",
  "NUMERIC",
  "REAL",
  "TEXT",
  "TIMESTAMP",
  "VARCHAR",
]);

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// token regex — order of alternatives matters
const TOKEN = new RegExp(
  [
    String.raw`('(?:[^'\\]|''|\\.)*')`, // 1 single-quoted string
    String.raw`("(?:[^"\\]|\\.)*")`, // 2 double-quoted identifier
    `(\`${"(?:[^"}\`${String.raw`\\]|\\.)*`}\`)`, // 3 backtick identifier
    String.raw`(\[(?:[^\]\\]|\\.)*\])`, // 4 bracket identifier
    String.raw`(--[^\n]*)`, // 5 line comment
    String.raw`(\/\*[\s\S]*?\*\/)`, // 6 block comment
    String.raw`((?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?)`, // 7 number
    `([A-Za-z_][A-Za-z0-9_]*)`, // 8 word
    `([ \t\n\r]+)`, // 9 whitespace
    `(.)`, // 10 anything else
  ].join("|"),
  "g",
);

export function highlightSql(sql: string): string {
  let out = "";
  TOKEN.lastIndex = 0;
  let m = TOKEN.exec(sql);
  while (m !== null) {
    const [, sq, dq, bq, br, lc, bc, num, word, ws, other] = m;
    if (sq) {
      out += `<span class="sql-string">${esc(sq)}</span>`;
    } else if (dq || bq || br) {
      out += `<span class="sql-string">${esc(m[0])}</span>`;
    } else if (lc || bc) {
      out += `<span class="sql-comment">${esc(m[0])}</span>`;
    } else if (num) {
      out += `<span class="sql-number">${esc(num)}</span>`;
    } else if (word) {
      if (KEYWORDS.has(word.toUpperCase())) {
        out += `<span class="sql-keyword">${esc(word)}</span>`;
      } else {
        out += esc(word);
      }
    } else if (ws) {
      out += ws;
    } else if (other) {
      out += esc(other);
    }
    m = TOKEN.exec(sql);
  }
  return out;
}
