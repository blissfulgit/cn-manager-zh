"""cn-manager-zh — ComfyUI-Manager 简体中文补丁。

纯前端扩展：不注册任何节点，只向页面注入一个 web 扩展脚本，
在 ComfyUI-Manager 的面板渲染后按词表替换英文文案。
"""

WEB_DIRECTORY = "js"

__all__ = ["WEB_DIRECTORY"]
