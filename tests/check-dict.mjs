/**
 * 词表静态检查 —— 不依赖浏览器，纯文本解析。
 *
 * 目的：拦住最容易在 PR 里混进来的几类低级错误
 *   1. 自映射（"Foo": "Foo"）—— 无意义，还会让查表多走一遍
 *   2. 重复 key（后一条会静默覆盖前一条，排查起来极痛苦）
 *   3. 空 key / 空 value
 *   4. key 里已经含中文（说明写错了方向，把译文当原文填了）
 *   5. value 首尾带空白或含换行（渲染出来会错位）
 *   6. 结构缺失（DICT / LONG_PATTERNS / PATTERNS / registerExtension / MutationObserver）
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const SRC = resolve(here, "..", "js", "zh-patch.js");
const src = readFileSync(SRC, "utf8");

const errors = [];
const warnings = [];

/* ---------- 1. 结构检查 ---------- */

const REQUIRED = [
	["const DICT", "词表对象"],
	["const LONG_PATTERNS", "长句规则"],
	["const PATTERNS", "变量规则"],
	["app.registerExtension", "扩展注册"],
	["new MutationObserver", "DOM 监听"],
	["cn-manager-zh.enabled", "开关存储键"],
];

for (const [needle, label] of REQUIRED) {
	if (!src.includes(needle)) errors.push(`结构缺失：${label}（找不到 \`${needle}\`）`);
}

/* ---------- 2. 提取 DICT ---------- */

const dictStart = src.indexOf("const DICT");
if (dictStart === -1) {
	console.error("找不到 const DICT，无法继续检查");
	process.exit(1);
}

// 从 "const DICT = {" 的 { 开始做括号配平（跳过字符串内的括号）
let i = src.indexOf("{", dictStart);
let depth = 0;
let end = -1;
let inStr = false;
let esc = false;
for (let p = i; p < src.length; p++) {
	const ch = src[p];
	if (inStr) {
		if (esc) esc = false;
		else if (ch === "\\") esc = true;
		else if (ch === '"') inStr = false;
		continue;
	}
	if (ch === '"') { inStr = true; continue; }
	if (ch === "{") depth++;
	else if (ch === "}") {
		depth--;
		if (depth === 0) { end = p; break; }
	}
}
if (end === -1) {
	console.error("DICT 大括号未闭合");
	process.exit(1);
}

const dictBody = src.slice(i + 1, end);

/* ---------- 3. 逐条解析 ---------- */

const ENTRY = /"((?:[^"\\]|\\.)*)"\s*:\s*"((?:[^"\\]|\\.)*)"\s*,?/g;
const seen = new Map();
const hasCJK = (s) => /[\u3400-\u4dbf\u4e00-\u9fff\uff00-\uffef]/.test(s);

let m;
let count = 0;
while ((m = ENTRY.exec(dictBody)) !== null) {
	const key = m[1];
	const val = m[2];
	count++;

	if (!key.trim()) errors.push("存在空 key");
	if (!val.trim()) errors.push(`空译文：${JSON.stringify(key)}`);
	if (key === val) errors.push(`自映射：${JSON.stringify(key)} —— key 与 value 完全相同`);

	if (seen.has(key)) {
		errors.push(`重复 key：${JSON.stringify(key)}（第 ${seen.get(key)} 条与第 ${count} 条）`);
	} else {
		seen.set(key, count);
	}

	if (hasCJK(key)) warnings.push(`key 含中文，疑似方向写反：${JSON.stringify(key)}`);
	if (val !== val.trim()) warnings.push(`译文首尾有空白：${JSON.stringify(key)}`);
	if (val.includes("\n")) warnings.push(`译文含换行：${JSON.stringify(key)}`);
	if (!hasCJK(val) && key !== val) warnings.push(`译文不含中文：${JSON.stringify(key)} -> ${JSON.stringify(val)}`);
}

/* ---------- 4. 规则数组非空 ---------- */

for (const name of ["LONG_PATTERNS", "PATTERNS"]) {
	const at = src.indexOf(`const ${name}`);
	if (at === -1) continue;
	const arrEnd = src.indexOf("];", at);
	if (arrEnd === -1) {
		errors.push(`${name} 数组未正确闭合`);
		continue;
	}
	const body = src.slice(at, arrEnd);
	if (body.trim().endsWith("[")) errors.push(`${name} 为空数组`);
}

/* ---------- 5. 输出 ---------- */

console.log(`扫描 ${SRC}`);
console.log(`词条总数：${count}（唯一 key ${seen.size}）`);

if (warnings.length) {
	console.log(`\n⚠️  警告 ${warnings.length} 条`);
	for (const w of warnings) console.log(`   - ${w}`);
}

if (errors.length) {
	console.log(`\n❌ 错误 ${errors.length} 条`);
	for (const e of errors) console.log(`   - ${e}`);
	process.exit(1);
}

console.log("\n✅ 词表检查通过");
