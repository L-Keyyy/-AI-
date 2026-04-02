# AI Sidebar Assistant（Gemini + 豆包）

一个 Chrome MV3 扩展：在任意网页右侧打开 AI 侧栏，把问题发送到网页端 **Gemini** 或 **豆包**，并把回答回传到侧栏显示。

## 项目目标

- 在不离开当前页面的情况下，完成提问、总结、记录笔记。
- 支持多模型切换（Gemini / 豆包）。
- 提供稳定的双端通信（侧栏页面 ↔ 模型网页）。
- 统一输出排版（Markdown 结构化显示）。

## 主要功能

- 侧边栏悬浮球与开关
- 侧栏宽度拖拽调整
- 亮色 / 暗色主题切换
- 模型切换（Gemini / 豆包）
- 聊天记录面板（按当前模型切换）
- 新建对话（在当前模型网页端新建）
- 选中文本自动注入输入框
- “总结整页”快捷功能（发送当前 URL）
- 笔记模式（本地保存）与 Markdown 导出
- AI 回答 Markdown 渲染（标题、列表、代码块、引用、链接等）

## 目录结构

```text
D:\GJ\cb
├─ README.md
└─ cb
   ├─ manifest.json
   ├─ background.js
   ├─ content-target.js     # 通用页面侧栏 UI 与交互
   ├─ content-gemini.js     # Gemini 网页端适配器
   ├─ content-doubao.js     # 豆包网页端适配器
   ├─ page-network-bridge.js
   └─ 笔记
```

## 环境要求

- Chrome（支持 Manifest V3）
- 已登录可用的 Gemini 与豆包网页端账号

## 安装方式（开发者模式）

1. 打开 `chrome://extensions/`
2. 开启右上角“开发者模式”
3. 点击“加载已解压的扩展程序”
4. 选择目录：`D:\GJ\cb\cb`
5. 确认扩展加载成功

## 使用说明

1. 在任意网页点击悬浮球，打开侧栏。
2. 在底部模型选择中选择 `Gemini` 或 `豆包`。
3. 输入问题并发送，回答会回传到侧栏。
4. 点击头部“聊天记录”按钮，可查看当前模型的历史会话；切换模型后，列表自动切换。
5. 点击“新建AI对话”会在当前选中模型网页端创建新会话。
6. 点击“总结整页”会将当前页面 URL 发送给模型。
7. 切换“笔记模式”后，输入内容会作为笔记保存，并导出为 Markdown 文件。

## 笔记保存与导出

- 扩展内部会把笔记保存到 `chrome.storage.local`。
- 同时通过 `downloads` API 导出 `.md` 文件，默认导出到浏览器下载目录下的 `笔记/` 子目录。
- 如果希望落到 `D:\GJ\cb\cb\笔记`，请把 Chrome 下载目录设置为 `D:\GJ\cb\cb`。

## 架构说明

- `content-target.js`：
  - 注入 Shadow DOM 侧栏 UI
  - 负责用户交互、渲染、模型选择、聊天记录面板
  - 通过 runtime message 向 `background.js` 发起请求
- `background.js`：
  - 统一路由到 Gemini / 豆包标签页
  - 管理请求/响应中转
  - 处理笔记 Markdown 导出
- `content-gemini.js` / `content-doubao.js`：
  - 分别适配各自网页端 DOM + 网络流
  - 执行发送、等待完成、提取回答、读取历史、打开历史会话

## 常见问题

### 1) 点击发送后无响应

- 检查 Gemini/豆包标签页是否已打开且登录。
- 刷新模型页面后重试。
- 重新加载扩展后再试。

### 2) 出现 `Extension context invalidated`

- 这是扩展热更新后上下文失效，刷新当前页面与模型页面即可。

### 3) 聊天记录为空

- 先在对应模型网页端产生历史会话，再点“刷新”。
- 切换模型后，历史源也会切换，属于正常行为。

### 4) 笔记没出现在项目目录

- `downloads` API 受 Chrome 下载目录约束。
- 修改浏览器下载目录后，导出路径会随之变化。

## 权限说明（manifest）

- `tabs`：查找并通信模型标签页
- `storage`：保存配置、会话状态、笔记
- `scripting`：必要时注入内容脚本
- `downloads`：导出 Markdown 笔记
- `host_permissions: <all_urls>`：支持通用网页侧栏

## 开发检查

可用以下命令做语法检查：

```powershell
node --check background.js
node --check content-target.js
node --check content-gemini.js
node --check content-doubao.js
```

