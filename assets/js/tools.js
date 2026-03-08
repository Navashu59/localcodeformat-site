function trackToolEvent(name, params) {
  if (typeof window.gtag === "function") {
    window.gtag("event", name, params || {});
  }
}

function setToolOutput(outputEl, explainEl, output, explanation) {
  if (outputEl) outputEl.textContent = output || "";
  if (explainEl) explainEl.textContent = explanation || "";
}

function setToolStatus(statusEl, tone, text) {
  if (!statusEl) return;
  statusEl.classList.remove("status-ok", "status-warn", "status-error");
  statusEl.classList.add(tone);
  statusEl.textContent = text;
}

function formatJsonString(input, indent) {
  const parsed = JSON.parse(input);
  return JSON.stringify(parsed, null, indent);
}

function minifyJsonString(input) {
  return JSON.stringify(JSON.parse(input));
}

function sqlKeywordCase(text, mode) {
  const keywords = [
    "select", "from", "where", "group by", "order by", "left join", "right join",
    "inner join", "outer join", "join", "having", "limit", "offset", "insert into",
    "values", "update", "set", "delete", "case", "when", "then", "else", "end",
    "and", "or", "on"
  ];
  return keywords.reduce((acc, keyword) => {
    const pattern = new RegExp("\\b" + keyword.replace(" ", "\\s+") + "\\b", "gi");
    const replacement = mode === "lower" ? keyword.toLowerCase() : keyword.toUpperCase();
    return acc.replace(pattern, replacement);
  }, text);
}

function formatSqlString(input, keywordCase) {
  let text = input.replace(/\s+/g, " ").trim();
  text = sqlKeywordCase(text, keywordCase);
  const clauses = [
    "SELECT", "FROM", "WHERE", "GROUP BY", "ORDER BY", "LEFT JOIN", "RIGHT JOIN",
    "INNER JOIN", "OUTER JOIN", "JOIN", "HAVING", "LIMIT", "OFFSET", "VALUES", "SET"
  ];
  clauses.forEach((clause) => {
    const pattern = new RegExp("\\s+" + clause.replace(" ", "\\s+") + "\\b", "g");
    text = text.replace(pattern, "\n" + clause);
  });
  text = text.replace(/,\s*/g, ",\n  ");
  return text.trim();
}

function formatHtmlNode(node, level) {
  const indent = "  ".repeat(level);
  if (node.nodeType === Node.TEXT_NODE) {
    const content = node.textContent.trim();
    return content ? indent + content + "\n" : "";
  }
  if (node.nodeType !== Node.ELEMENT_NODE) return "";

  const tag = node.tagName.toLowerCase();
  const attrs = Array.from(node.attributes).map((attr) => ` ${attr.name}="${attr.value}"`).join("");
  const children = Array.from(node.childNodes).map((child) => formatHtmlNode(child, level + 1)).join("");

  if (!children.trim()) {
    return `${indent}<${tag}${attrs}></${tag}>\n`;
  }
  return `${indent}<${tag}${attrs}>\n${children}${indent}</${tag}>\n`;
}

function formatHtmlString(input) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(input, "text/html");
  if (doc.querySelector("parsererror")) {
    throw new Error("Unable to parse HTML input.");
  }
  return Array.from(doc.body.childNodes).map((node) => formatHtmlNode(node, 0)).join("").trim();
}

function buildDiffLines(leftText, rightText) {
  const left = leftText.split("\n");
  const right = rightText.split("\n");
  const max = Math.max(left.length, right.length);
  const lines = [];

  for (let index = 0; index < max; index += 1) {
    const leftLine = left[index];
    const rightLine = right[index];
    if (leftLine === rightLine) {
      lines.push("  " + (leftLine || ""));
    } else {
      if (leftLine !== undefined) lines.push("- " + leftLine);
      if (rightLine !== undefined) lines.push("+ " + rightLine);
    }
  }

  return lines.join("\n");
}

function attachJsonFormatter() {
  const input = document.getElementById("json-input");
  if (!input) return;

  const output = document.getElementById("json-output");
  const explain = document.getElementById("json-explain");
  const status = document.getElementById("json-status");
  const indent = document.getElementById("json-indent");

  document.getElementById("json-format")?.addEventListener("click", () => {
    try {
      const formatted = formatJsonString(input.value, Number(indent.value || 2));
      setToolOutput(output, explain, formatted, "Valid JSON. Formatted locally in your browser.");
      setToolStatus(status, "status-ok", "Valid JSON");
      trackToolEvent("tool_used", { tool_name: "json_formatter", action_name: "format" });
    } catch (error) {
      setToolOutput(output, explain, "", error.message);
      setToolStatus(status, "status-error", "Invalid JSON");
    }
  });

  document.getElementById("json-minify")?.addEventListener("click", () => {
    try {
      const minified = minifyJsonString(input.value);
      setToolOutput(output, explain, minified, "Valid JSON. Minified locally in your browser.");
      setToolStatus(status, "status-ok", "Minified successfully");
      trackToolEvent("tool_used", { tool_name: "json_formatter", action_name: "minify" });
    } catch (error) {
      setToolOutput(output, explain, "", error.message);
      setToolStatus(status, "status-error", "Invalid JSON");
    }
  });

  document.getElementById("json-clear")?.addEventListener("click", () => {
    input.value = "";
    setToolOutput(output, explain, "", "Paste JSON above, then format or minify it locally.");
    setToolStatus(status, "status-warn", "Waiting for input");
  });
}

function attachJsonValidator() {
  const input = document.getElementById("json-validator-input");
  if (!input) return;

  const output = document.getElementById("json-validator-output");
  const explain = document.getElementById("json-validator-explain");
  const status = document.getElementById("json-validator-status");

  document.getElementById("json-validate")?.addEventListener("click", () => {
    try {
      const parsed = JSON.parse(input.value);
      const keys = typeof parsed === "object" && parsed !== null ? Object.keys(parsed).length : 0;
      setToolOutput(output, explain, JSON.stringify(parsed, null, 2), `Valid JSON detected. Top-level key count: ${keys}.`);
      setToolStatus(status, "status-ok", "Valid JSON");
      trackToolEvent("tool_used", { tool_name: "json_validator", action_name: "validate" });
    } catch (error) {
      setToolOutput(output, explain, "", error.message);
      setToolStatus(status, "status-error", "Invalid JSON");
    }
  });
}

function attachSqlFormatter() {
  const input = document.getElementById("sql-input");
  if (!input) return;

  const output = document.getElementById("sql-output");
  const explain = document.getElementById("sql-explain");
  const status = document.getElementById("sql-status");
  const keywordCase = document.getElementById("sql-keyword-case");

  document.getElementById("sql-format")?.addEventListener("click", () => {
    try {
      const formatted = formatSqlString(input.value, keywordCase.value || "upper");
      setToolOutput(output, explain, formatted, "Query reformatted locally. Review the output before production use.");
      setToolStatus(status, "status-ok", "Formatted locally");
      trackToolEvent("tool_used", { tool_name: "sql_formatter", action_name: "format" });
    } catch (error) {
      setToolOutput(output, explain, "", error.message);
      setToolStatus(status, "status-error", "Unable to format");
    }
  });
}

function attachHtmlFormatter() {
  const input = document.getElementById("html-input");
  if (!input) return;

  const output = document.getElementById("html-output");
  const explain = document.getElementById("html-explain");
  const status = document.getElementById("html-status");

  document.getElementById("html-format")?.addEventListener("click", () => {
    try {
      const formatted = formatHtmlString(input.value);
      setToolOutput(output, explain, formatted, "Markup formatted in the browser. Invalid nesting may still need manual review.");
      setToolStatus(status, "status-ok", "Formatted locally");
      trackToolEvent("tool_used", { tool_name: "html_formatter", action_name: "format" });
    } catch (error) {
      setToolOutput(output, explain, "", error.message);
      setToolStatus(status, "status-error", "Unable to parse HTML");
    }
  });
}

function attachDiffChecker() {
  const left = document.getElementById("diff-left");
  const right = document.getElementById("diff-right");
  if (!left || !right) return;

  const output = document.getElementById("diff-output");
  const explain = document.getElementById("diff-explain");
  const status = document.getElementById("diff-status");

  document.getElementById("diff-compare")?.addEventListener("click", () => {
    const diff = buildDiffLines(left.value, right.value);
    setToolOutput(output, explain, diff, "Minus lines are only in the left block. Plus lines are only in the right block.");
    setToolStatus(status, "status-ok", "Comparison ready");
    trackToolEvent("tool_used", { tool_name: "diff_checker", action_name: "compare" });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  attachJsonFormatter();
  attachJsonValidator();
  attachSqlFormatter();
  attachHtmlFormatter();
  attachDiffChecker();
});
