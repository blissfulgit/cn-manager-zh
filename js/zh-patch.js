/**
 * cn-manager-zh — ComfyUI-Manager 简体中文补丁
 *
 * 不改 ComfyUI-Manager 源码，运行时按词表替换 DOM 文案。
 * 升级 Manager 不会失效，可随时通过 localStorage 开关。
 *
 * 开关：
 *   localStorage.setItem("cn-manager-zh.enabled", "0")  // 关闭
 *   localStorage.setItem("cn-manager-zh.enabled", "1")  // 开启
 *   没有设置过时跟随 ComfyUI 的语言（Comfy.Locale 以 zh 开头才自动开启）
 *
 * 运行时扩展词表：
 *   window.cnManagerZh.add({ "Some English": "某中文" })
 */

import { app } from "../../scripts/app.js";

const VERSION = "1.0.1";
const LS_KEY = "cn-manager-zh.enabled";

// ---------------------------------------------------------------------------
// 词表（精确匹配，区分大小写；键为 trim 后的完整文本）
// ---------------------------------------------------------------------------
const DICT = {
	// —— 主菜单 ——
	"ComfyUI Manager": "ComfyUI 管理器",
	"Custom Nodes Manager": "节点管理",
	"Install Missing Custom Nodes": "安装缺失节点",
	"Install New Custom Nodes": "安装新节点",
	"Install Custom Nodes": "安装节点",
	"Model Manager": "模型管理",
	"Snapshot Manager": "快照管理",
	"Node Usage Analyzer": "节点占用分析",
	"Community Manual": "社区手册",
	"ComfyUI Docs": "ComfyUI 文档",
	"ComfyUI Examples": "ComfyUI 示例",
	"Comfy Custom Node How To": "自定义节点编写指南",
	"ComfyUI Guide To Making Custom Nodes": "ComfyUI 自定义节点开发指南",
	"Share your art": "分享作品",
	"Workflow Gallery": "工作流画廊",
	"Install PIP packages": "安装 PIP 包",
	"Install via Git URL": "通过 Git 地址安装",
	"Custom Nodes In Workflow": "工作流中的节点",
	"Nodes Info": "节点信息",
	"Select Version": "选择版本",
	"Select": "选择",
	"Update All": "更新全部",
	"Update All Custom Nodes": "全部更新节点",
	"Update ComfyUI": "更新 ComfyUI",
	"Switch ComfyUI": "切换 ComfyUI",
	"Restart": "重启",
	"RESTART": "重启",
	"Close": "关闭",
	"Cancel": "取消",
	"Confirm": "确认",
	"OK": "确定",
	"Save": "保存",
	"Open": "打开",
	"Back": "返回",
	"Refresh": "刷新",
	"Refresh Required": "需要刷新",
	"Toggle Manager Menu Visibility": "显示/隐藏管理器菜单",
	"Toggle Custom Nodes Manager Visibility": "显示/隐藏节点管理器",

	// —— 操作 ——
	"Install": "安装",
	"Uninstall": "卸载",
	"Reinstall": "重装",
	"Update": "更新",
	"Try install": "尝试安装",
	"Try Install": "尝试安装",
	"Try update": "尝试更新",
	"Try Update": "尝试更新",
	"Try fix": "尝试修复",
	"Try Fix": "尝试修复",
	"Fix": "修复",
	"Enable": "启用",
	"Disable": "禁用",
	"Enable All": "全部启用",
	"Disable All": "全部禁用",
	"Stop": "停止",
	"Start": "开始",
	"Search": "搜索",
	"Filter": "过滤",
	"Preview": "预览",
	"Check Missing": "检查缺失",
	"Check Update": "检查更新",
	"Uninstall Selected": "卸载所选",
	"Install Selected": "安装所选",
	"Switch Ver": "切换版本",
	"Restart Required": "需要重启",

	// —— 状态 ——
	"Installed": "已安装",
	"Not Installed": "未安装",
	"Missing": "缺失",
	"Disabled": "已禁用",
	"Enabled": "已启用",
	"Selected": "已选",
	"In Workflow": "工作流中",
	"Used In Workflow": "工作流中使用",
	"Used In Any Workflow": "任意工作流中使用",
	"Installed and Unused": "已安装未使用",
	"Inactive": "未启用",
	"Active": "已启用",
	"Conflict with": "冲突于",
	"Import Failed": "导入失败",

	// —— 分类 ——
	"All": "所有",
	"Favorites": "收藏",
	"Alternatives of A1111": "A1111 替代品",

	// —— 表头 ——
	"Name": "名称",
	"Title": "标题",
	"Version": "版本",
	"Action": "操作",
	"Description": "描述",
	"Author": "作者",
	"Size": "大小",
	"Type": "类型",
	"Base": "基模",
	"Save Path": "保存路径",
	"Filename": "文件名",
	"Last Update": "最近更新",
	"Used in": "用于",

	// —— 主菜单表单 ——
	"ComfyUI Manager Menu": "管理器菜单",
	"Nodes": "节点",
	"(none selected)": "（未选择）",
	"Issue News:": "问题公告：",
	"DB": "数据库",
	"Channel": "通道",
	"Preview method": "预览方式",
	"Share": "分享",
	"Component": "组件",
	"Keywords: security": "关键词：安全",
	"Issue News": "问题公告",
	"EXPERIMENTAL": "实验性",
	"Channel (1day cache)": "通道（1 天缓存）",
	"Channel (7day cache)": "通道（7 天缓存）",
	"Channel (cache)": "通道（缓存）",
	"Channel (remote)": "通道（远程）",
	"Channel (local)": "通道（本地）",
	"default": "默认",
	"Auto": "自动",
	"None": "无",
	"Use workflow version": "使用工作流版本",
	"ComfyUI Stable Version": "ComfyUI 稳定版",
	"Nickname": "昵称",
	"Nickname (hide built-in)": "昵称（隐藏内置）",
	"Remote": "远程",
	"Cache": "缓存",
	"Local": "本地",

	// —— 提示 ——
	"To apply the snapshot, please": "要应用该快照，请",
	"Installing...": "安装中…",
	"Loading...": "加载中…",
	"Loading": "加载中",
	"Success": "成功",
	"Failed": "失败",
	"Error": "错误",
	"Warning": "警告",
	"Download": "下载",
	"Download file": "下载文件",
};

// ---------------------------------------------------------------------------
// 长句 / 带变量的文案：正则替换（在精确匹配未命中时使用）
// ---------------------------------------------------------------------------
const LONG_PATTERNS = [
	[/[Ll]egacy ComfyUI[-\s]?(?:Manager|管理器)\s*data backup exists[\s\S]{0,160}?details\./g,
		"存在旧版 ComfyUI 管理器的数据备份，确认无用后可删除，详情见终端日志。"],
];

const PATTERNS = [
	[/\bRestart Required\b/g, "需要重启"],
	[/\bRefresh Required\b/g, "需要刷新"],
	[/\bInstalling\.\.\./g, "安装中…"],
	[/\bLoading\.\.\./g, "加载中…"],
	[/^ComfyUI[\s-]Manager\s+V?([\d.]+)$/, "ComfyUI 管理器 V$1"],
	[/(\d[\d,]*)\s+custom nodes/g, "$1 个节点"],
	[/(\d[\d,]*)\s+external models/g, "$1 个外部模型"],
	[/(\d+)\s+nodes\b/g, "$1 个节点"],
	[/(\d+)\s+conflicts?\b/g, "$1 个冲突"],
	[/\bCustom Nodes Manager\b/g, "节点管理"],
	[/\bModel Manager\b/g, "模型管理"],
	[/\bSnapshot Manager\b/g, "快照管理"],
];

// ---------------------------------------------------------------------------
// 作用域：只翻译 ComfyUI-Manager 注入的 DOM
//
// 关键：必须按 class 的「token 前缀」匹配，不能用 [class*="nu-"] 这种子串匹配。
// menu-button / comfy-menu-bg / comfy-context-menu-filter 里都含 "nu-" 子串，
// 子串匹配会把 ComfyUI 自己的右键菜单和顶栏一起判进作用域。
// ---------------------------------------------------------------------------
const TOKEN_PREFIXES = ["cm-", "cmm-", "cn-", "nu-"];
const MANAGER_CLASS_SEL = TOKEN_PREFIXES
	.map((p) => `[class^="${p}"], [class*=" ${p}"]`)
	.join(", ");

const SKIP_TAGS = new Set(["SCRIPT", "STYLE", "TEXTAREA", "CANVAS", "CODE", "PRE", "INPUT"]);
const ATTRS = ["title", "placeholder", "aria-label"];

const DATA_CELL_SEL = ".cn-pack-name, .cn-pack-version, .cn-pack-desc, .cmm-node-name, .cmm-node-desc, .nu-pack-name";

// ComfyUI 全局提示容器（新前端的 toast 列表是裸 <ol class="pointer-events-none ...">）
const TOAST_SEL = '[class*="toast"], ol[class*="pointer-events-none"]';

// 只翻「提到 Manager」的提示，避免把 ComfyUI 自己的 Error / Success 一起改了
const MANAGER_HINT = /manager/i;

let enabled = true;

/**
 * 判定元素所处的可见范围。
 * @returns {"manager"|"toast"|null}
 */
function scopeKind(el) {
	if (!el) return null;
	// 表格里的数据（包名、版本、描述）属于内容，不是 UI 文案
	if (el.closest(DATA_CELL_SEL)) return null;
	if (el.closest(MANAGER_CLASS_SEL)) return "manager";
	if (el.closest(TOAST_SEL)) return "toast";
	const modal = el.closest(".comfy-modal");
	if (modal && modal.querySelector(MANAGER_CLASS_SEL)) return "manager";
	return null;
}

function lookup(text) {
	const key = text.trim();
	if (!key) return null;
	const hit = DICT[key];
	if (hit !== undefined) return { from: key, to: hit };
	let out = key;
	for (const [re, rep] of LONG_PATTERNS) out = out.replace(re, rep);
	for (const [re, rep] of PATTERNS) out = out.replace(re, rep);
	if (out !== key) return { from: key, to: out };
	return null;
}

function translateText(node) {
	const raw = node.nodeValue;
	if (!raw || !raw.trim()) return;
	const el = node.parentElement;
	if (!el) return;
	const kind = scopeKind(el);
	if (!kind) return;
	// 全站 toast 里只处理提到 Manager 的提示
	if (kind === "toast" && !MANAGER_HINT.test(raw)) return;
	const hit = lookup(raw);
	if (!hit) return;
	const next = raw.replace(hit.from, hit.to);
	if (next === raw) return;
	// 写回会再次触发 observer，但替换是幂等的（中文不会再命中英文词表），不会死循环
	node.nodeValue = next;
}

function translateAttrs(el) {
	if (!el || typeof el.getAttribute !== "function") return;
	const kind = scopeKind(el);
	// toast 只翻文本，不碰属性
	if (kind !== "manager") return;
	for (const attr of ATTRS) {
		const val = el.getAttribute(attr);
		if (!val || !val.trim()) continue;
		const hit = lookup(val);
		if (!hit) continue;
		el.setAttribute(attr, val.replace(hit.from, hit.to));
	}
}

function walkText(root, force = false) {
	if (!root) return;
	if (root.nodeType === Node.TEXT_NODE) {
		translateText(root);
		return;
	}
	if (root.nodeType !== Node.ELEMENT_NODE) return;

	// 预筛：新增子树自身不在 Manager 里、内部也没有 Manager 元素 → 整棵跳过
	if (!force && !scopeKind(root) && !root.querySelector(MANAGER_CLASS_SEL) && !root.querySelector(TOAST_SEL)) return;

	translateAttrs(root);
	if (SKIP_TAGS.has(root.tagName)) return;
	const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT, {
		acceptNode(n) {
			if (n.nodeType === Node.ELEMENT_NODE && SKIP_TAGS.has(n.tagName)) {
				// INPUT / TEXTAREA 没有子文本节点，但自身属性（placeholder）要翻译
				if (n.tagName === "INPUT" || n.tagName === "TEXTAREA") {
					return NodeFilter.FILTER_ACCEPT;
				}
				return NodeFilter.FILTER_REJECT;
			}
			return NodeFilter.FILTER_ACCEPT;
		},
	});
	let n = walker.nextNode();
	while (n) {
		if (n.nodeType === Node.TEXT_NODE) translateText(n);
		else translateAttrs(n);
		n = walker.nextNode();
	}
}

function onMutations(mutations) {
	if (!enabled) return;
	for (const m of mutations) {
		if (m.type === "characterData") {
			translateText(m.target);
		} else if (m.type === "attributes") {
			translateAttrs(m.target);
		} else {
			for (const node of m.addedNodes) walkText(node);
		}
	}
}

let observer = null;

function start() {
	if (observer) return;
	observer = new MutationObserver(onMutations);
	observer.observe(document.body, {
		childList: true,
		subtree: true,
		characterData: true,
		attributes: true,
		attributeFilter: ATTRS,
	});
	// 首屏无条件扫一遍：此时 Manager 面板通常还没渲染，但提示浮层可能已经在
	walkText(document.body, true);
	console.log(`[cn-manager-zh] v${VERSION} 已启用`);
}

/** 取 ComfyUI 当前语言，取不到返回空串 */
function appLocale() {
	try {
		const viaExt = app?.extensionManager?.setting?.get?.("Comfy.Locale");
		if (typeof viaExt === "string" && viaExt) return viaExt;
	} catch (e) {
		/* 老版本前端没有这个 API */
	}
	try {
		const viaUi = app?.ui?.settings?.getSettingValue?.("Comfy.Locale");
		if (typeof viaUi === "string" && viaUi) return viaUi;
	} catch (e) {
		/* ignore */
	}
	const lang = document.documentElement.lang || navigator.language || "";
	return typeof lang === "string" ? lang : "";
}

app.registerExtension({
	name: "cn.manager.zh",
	setup() {
		const stored = localStorage.getItem(LS_KEY);
		if (stored !== null) {
			// 用户显式开关过，以用户的为准
			enabled = stored !== "0";
		} else {
			// 否则跟随 ComfyUI 语言；语言取不到时保持开启（这个包本来就是中文用户主动装的）
			const loc = appLocale();
			enabled = loc ? /^zh/i.test(loc) : true;
		}
		if (enabled) start();
	},
});

// 暴露最小 API 供调试 / 扩展
window.cnManagerZh = {
	version: VERSION,
	add(map) {
		Object.assign(DICT, map);
		walkText(document.body, true);
	},
	disable() {
		enabled = false;
		localStorage.setItem(LS_KEY, "0");
	},
	enable() {
		enabled = true;
		localStorage.setItem(LS_KEY, "1");
		if (!observer) start();
		else walkText(document.body, true);
	},
	dict: DICT,
};
