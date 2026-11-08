/**
 * 加载测试 —— 在无 DOM 的 Node 环境里跑一遍模块顶层代码。
 *
 * 做法：把 `import { app } from "../../scripts/app.js"` 换成 globalThis 上的桩，
 * 再把改写后的源码写成临时 .mjs 动态 import。
 *
 * 能抓到的东西：DICT / PATTERNS 构建时的运行时错误、拼错的顶层标识符、
 * registerExtension 没被调用。
 * 抓不到的是 DOM 相关逻辑 —— 那部分只能靠真实浏览器手测。
 */

import { readFileSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, resolve, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const SRC = resolve(here, "..", "js", "zh-patch.js");
const TMP_DIR = resolve(here, ".tmp");

// 浏览器全局的最小桩：顶层代码会往 window 上挂 add()
globalThis.window = globalThis;
globalThis.localStorage = {
	getItem: () => null,
	setItem: () => {},
	removeItem: () => {},
};

let calls = 0;
let captured = null;
globalThis.__stubApp = {
	registerExtension(ext) {
		calls++;
		captured = ext;
	},
	extensionManager: { setting: { get: () => undefined } },
	ui: { settings: {} },
};

const src = readFileSync(SRC, "utf8");

const IMPORT_RE = /^[ \t]*import\s+\{[^}]*\}\s+from\s+["'][^"']*scripts\/app\.js["'];?[ \t]*$/m;
if (!IMPORT_RE.test(src)) {
	console.error("❌ 未找到预期的 import 语句（../../scripts/app.js），测试脚本需要同步更新");
	process.exit(1);
}

const patched = src.replace(
	IMPORT_RE,
	"const app = globalThis.__stubApp;"
);

mkdirSync(TMP_DIR, { recursive: true });
const tmpFile = join(TMP_DIR, "zh-patch.smoke.mjs");
writeFileSync(tmpFile, patched, "utf8");

let failed = false;
try {
	await import(pathToFileURL(tmpFile).href);
} catch (e) {
	console.error("❌ 模块加载失败：", e && e.stack ? e.stack.split("\n").slice(0, 6).join("\n") : e);
	failed = true;
}

if (!failed) {
	if (calls !== 1) {
		console.error(`❌ registerExtension 调用次数应为 1，实际 ${calls}`);
		failed = true;
	} else if (!captured || typeof captured.setup !== "function") {
		console.error("❌ 注册的扩展缺少 setup()");
		failed = true;
	} else {
		console.log("✅ 模块加载成功，扩展已注册（setup 就绪）");
	}
}

rmSync(TMP_DIR, { recursive: true, force: true });
process.exit(failed ? 1 : 0);
