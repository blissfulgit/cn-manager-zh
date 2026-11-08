# cn-manager-zh

ComfyUI-Manager 简体中文补丁 —— **不改 Manager 源码**，装完刷新浏览器即生效，Manager 升级也不会失效。

> ComfyUI 主界面（画布、菜单、设置）已经有官方 i18n，可以切成中文；但 ComfyUI-Manager 注入的面板是独立 DOM，官方至今没有中文。
> 这个扩展只做一件事：在 Manager 面板渲染后，按词表把英文文案换成中文。

## 效果

| 面板 | 状态 |
|---|---|
| 主菜单（Manager Menu） | ✅ 全中文 |
| 模型管理（Model Manager） | ✅ 表头、按钮、筛选、计数 |
| 节点管理（Custom Nodes Manager） | ✅ 表头、按钮、筛选、计数 |
| 节点占用分析（Node Usage Analyzer） | ✅ |
| 快照管理（Snapshot Manager） | ✅ |
| 顶部提示浮层（startup alerts / toast） | ✅ |

不翻译的内容（有意为之）：包名、模型名、版本号、作者、描述正文、新闻内容 —— 这些是数据不是 UI，翻了反而找不到东西。

## 安装

```bash
cd ComfyUI/custom_nodes
git clone https://github.com/blissfulgit/cn-manager-zh.git
```

重启 ComfyUI，浏览器 `Ctrl+Shift+R` 强刷。

便携版同理，路径换成 `ComfyUI_windows_portable/ComfyUI/custom_nodes`。

## 开关

浏览器控制台执行：

```js
localStorage.setItem("cn-manager-zh.enabled", "0");  // 关闭，刷新后恢复英文
localStorage.setItem("cn-manager-zh.enabled", "1");  // 开启
```

也可以直接在 ComfyUI 的 Custom Nodes Manager 里禁用本扩展。

## 补充词表

遇到没翻到的文案，两种方式：

```js
// 1) 运行时临时加（刷新后失效）
window.cnManagerZh.add({
  "Some English": "某个中文",
  "Another Phrase": "另一句",
});

// 2) 永久生效 —— 改 js/zh-patch.js 里的 DICT，提 PR
```

词表分三层，按优先级：

| 层 | 位置 | 匹配方式 |
|---|---|---|
| 1 | `DICT` | trim 后完全相等 |
| 2 | `LONG_PATTERNS` | 正则，用于长句 / 多行提示 |
| 3 | `PATTERNS` | 正则，用于带变量的文案（`564 external models` → `564 个外部模型`） |

## 工作原理

```
MutationObserver 监听 body
  └─ 新增节点 / 文本变更 / 属性变更
       └─ 判断是否在 Manager 作用域内
            ├─ [class*="cm-"] / [class*="cn-"] / [class*="cmm-"] / [class*="nu-"]
            ├─ [class*="toast"] / ol[class*="pointer-events-none"]（提示浮层）
            └─ .comfy-modal 且内部含 Manager 元素
       └─ 查词表 → 替换文本节点 / title / placeholder / aria-label
```

几个实现上的坑，写在这儿省得后来人再踩：

1. **不能全局替换包名**。`ComfyUI-Manager` 同时出现在 UI 标题和表格数据里，早期版本用了全局正则，结果表格里的包名和描述被翻成中英混杂 —— 现在只匹配 `^ComfyUI[- ]Manager V[\d.]+$` 这种完整标题。
2. **数据单元格要排除**。Manager 的表格用 `classMap` 给数据列打标记（`.cn-pack-name`、`.cn-pack-desc`、`.cmm-node-name` 等），按这些 class 直接跳过。
3. **`INPUT` 要翻译属性但不能进文本遍历**。`placeholder` 是属性，不在文本节点里；而 `INPUT` 子树又没意义，容易漏。
4. **新前端的 toast 没有 toast 字样**。它是裸 `<ol class="pointer-events-none ...">`，不用 `ol[class*="pointer-events-none"]` 就抓不到。
5. **写回文本会再次触发 observer**，需要 `busy` 标志防抖，否则死循环。

## 与其他项目的区别

| 项目 | 状态 | 说明 |
|---|---|---|
| [AIGODLIKE-ComfyUI-Translation](https://github.com/AIGODLIKE/AIGODLIKE-ComfyUI-Translation) | 2025-03 后停更 | 覆盖 ComfyUI 主界面 + 大量节点；`Menus/ComfyUI-Manager.json` 有 128 条词条，实测只覆盖当前 Manager 3.42 文案的约 43% |
| [ZHO-ZHO-ZHO/ComfyUI-Manager-Zh-Chinese](https://github.com/ZHO-ZHO-ZHO/ComfyUI-Manager-Zh-Chinese) | 2023 年的整包汉化 | 直接替换 Manager 0.17 源码，早已无法用于 3.x |
| 本项目 | — | 只做 Manager 3.42+ 面板，不动源码，可与 AIGODLIKE 共存 |

两者共存没有冲突：词表不同源，替换都幂等（已是中文的不会再被处理）。

## 兼容性

- ComfyUI 0.44.0 / frontend 1.57.6 实测通过
- ComfyUI-Manager 3.42 实测通过
- Manager 大版本升级后如果新增了大量文案，词表可能需要补几条

## License

MIT
