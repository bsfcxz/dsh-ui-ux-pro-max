# dsh-ui-ux-pro-max

> 让 DeepSeek Harness 在你提到 UI/UX 时，**自动加载** ui-ux-pro-max 设计智能技能。

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![DSH Plugin](https://img.shields.io/badge/DeepSeek%20Harness-plugin-blue)](https://github.com/bsfcxz)
[![Tests](https://img.shields.io/badge/tests-66%20passing-brightgreen)](#-测试)

[English](#english) · [简体中文](#-简介)

---

## 📖 简介

`dsh-ui-ux-pro-max` 是一个 **DeepSeek Harness (DSH) 插件**，它为 [ui-ux-pro-max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) 技能提供**自动触发**能力。

### 它解决什么问题

DSH 的 `skill` 工具已经能让模型加载技能，但**前提是模型自己决定去调用它**。实际使用中：

- 你说「帮我优化一下这个 UI」，模型可能直接开始写代码，**完全忘记**去查设计规范；
- 你必须手动输入 `/ui-ux-pro-max` 才能强制加载，很啰嗦；
- 规范里那 79 种风格、192 套配色、74 组字体配对，模型没加载就等于不存在。

装上这个插件后，**只要你的话里出现 UI/UX 相关词汇，技能正文会自动注入当轮对话**——不需要你手动触发，也不需要模型「想起来」。

```
你：帮我做一个 SaaS 后台的 UI
         ↓
插件：检测到关键词 "UI" → 自动加载 ui-ux-pro-max 技能
         ↓
模型：拿到完整设计规范后再开始写代码 ✅
```

### 工作原理

插件监听 DSH 的 `agent/pre-step` 事件，扫描本轮**用户直接输入**的文本：

1. 命中触发词 → 通过 `ctx.skills.get()` 加载技能正文；
2. 把正文以 `skill-invocation` 消息拼进当轮，模型立即看到完整规范；
3. 未命中 → 完全不干预，原样放行。

关键在于：它复用了 **DSH 自带 `/技能名` 手势的同一条代码路径**，所以注入的内容会：

- ✅ 持久化进会话日志（session log），可回放、可 fork；
- ✅ 由 DSH 官方渲染器输出，格式与内置手势完全一致；
- ✅ 遵循技能自身的 `user-invocable` 策略。

### 特性

| 特性 | 说明 |
|---|---|
| 🎯 **精准触发** | 边界感知匹配，`build`/`guide`/`require`/`fluid` 绝不会误触发 |
| 🌏 **中英双语** | 支持 `界面`、`设计系统`、`配色方案`、`用户体验` 等中文词 |
| 🔒 **来源隔离** | 只扫描用户输入，模型输出/工具结果/子代理文本**无法伪造**触发 |
| 🔁 **每轮仅一次** | 同一轮内多次 step 不会重复注入，不浪费 token |
| 🛡️ **失败安全** | 技能缺失或注册表异常时静默放行并告警，不阻断对话 |
| ⚙️ **可开关** | 在「设置 → 插件」中一键启停 |

---

## 📦 安装

### 前置条件

1. **DeepSeek Harness** 已安装；
2. **ui-ux-pro-max 技能** 已安装到 `~/.dsh/skills/`
   （✅ 本仓库已内置，见下方安装步骤；插件只负责「自动触发」，技能本体需就位）；
3. 当前 Profile 的 `skill-filesystem` 提供者处于启用状态。

<details>
<summary><b>还没装 ui-ux-pro-max 技能？点这里展开（推荐用仓库内置的）</b></summary>

**本仓库已内置全部 7 个技能包**（`skills/` 目录，172 个文件，约 4.08 MB），
所以最省事的方式是直接把它们复制到 DSH 的用户级技能目录：

```bash
# 克隆后执行（假设克隆到 ~/.dsh/plugins/dsh-ui-ux-pro-max）
mkdir -p ~/.dsh/skills
cp -r ~/.dsh/plugins/dsh-ui-ux-pro-max/skills/* ~/.dsh/skills/
```

确认技能可被加载：

```bash
ls ~/.dsh/skills/ui-ux-pro-max/SKILL.md
```

<details>
<summary>改用官方 CLI 安装上游最新版（可选）</summary>

仓库内置的是上游 v2.x 快照，不会自动同步。想用最新版：

```bash
# 1. 全局安装官方 CLI
npm install -g ui-ux-pro-max-cli
```

```bash
# 2. 在任意空目录执行，装到当前目录的 .agents/skills/
uipro init --ai universal
```

然后把生成的技能目录移到 DSH 的用户级技能目录：

```bash
mv .agents/skills/* ~/.dsh/skills/
```

> ⚠️ 不要用 `uipro init --ai universal --global`：它装到 `~/.agents/skills/`，
> 虽然 DSH 也会扫描该目录，但路径里的 `python3 ~/.agents/skills/...` 在
> Windows 上不可用。放到 `~/.dsh/skills/` 更稳妥。

</details>

</details>

### 方式一：让 AI 帮你装（推荐）

直接把下面这句话发给你的 DSH：

> 请把 https://github.com/bsfcxz/dsh-ui-ux-pro-max 这个仓库克隆到
> `~/.dsh/plugins/dsh-ui-ux-pro-max`，把仓库里 `skills/` 下的技能复制到
> `~/.dsh/skills/`，然后用 `plugin_manager` 的 `install_bundle` 安装它。

DSH 会自行完成克隆、技能复制与安装（`install_bundle` 会处理包安装与 bundle 选择，无需手工改 profile）。

### 方式二：手动安装（两条命令）

```bash
# 1. 克隆到插件目录（与其它 DSH 插件放在一起）
git clone https://github.com/bsfcxz/dsh-ui-ux-pro-max.git \
  ~/.dsh/plugins/dsh-ui-ux-pro-max
```

```bash
# 2. 复制内置技能 + 安装 bundle
mkdir -p ~/.dsh/skills && cp -r ~/.dsh/plugins/dsh-ui-ux-pro-max/skills/* ~/.dsh/skills/
#    然后对你的 DSH 说：
#    「用 plugin_manager install_bundle 安装
#      ~/.dsh/plugins/dsh-ui-ux-pro-max」
```

安装成功后应看到 `application: "applied"`。

### 方式三：开发模式（符号链接）

便于改代码后立即生效：

```bash
git clone https://github.com/bsfcxz/dsh-ui-ux-pro-max.git
cd dsh-ui-ux-pro-max
mkdir -p ~/.dsh/skills && cp -r ./skills/* ~/.dsh/skills/

# 然后让 DSH 用 install_bundle 指向这个目录的绝对路径
```

> ⚠️ **修改插件源码后需要重启 DSH。**
> DSH 会缓存已加载的模块：替换已安装的包必须重启才能加载新的 JavaScript 模块代际。

---

## 🚀 使用方法

### 基础用法：直接说人话

装好后**无需任何额外操作**，正常说话即可触发：

```
帮我做一个 SaaS 后台的 UI
```

```
这个页面的 UX 有点乱，帮我看一下
```

```
给这个项目定一套设计系统
```

```
帮我选一套配色方案
```

```
做一个好看的界面
```

### 触发词一览

| 类别 | 触发示例 |
|---|---|
| **独立 `ui` / `ux`** | `Build a UI for my dashboard`、`improve the ux` |
| **组合形式** | `UI/UX review`、`ui-ux`、`UI + UX` |
| **设计术语** | `design system`、`design tokens`、`color palette`、`font pairing`、`typography`、`responsive layout`、`accessibility audit`、`user interface`、`user experience`、`design review` |
| **中文** | `界面`、`设计系统`、`配色方案`、`排版`、`交互设计`、`用户体验` |
| **复数形式** | `color palettes`、`responsive layouts`、`design systems` 等同样命中 |

### 不会误触发的例子

匹配是**边界感知**的，下列词汇**不会**触发：

| 输入 | 为什么不触发 |
|---|---|
| `build the project` | `build` 里的 `ui` 不是独立词 |
| `read the guide` | `guide` 同上 |
| `require a token` | `require` 同上 |
| `fluid simulation` | `fluid` 同上 |
| `a quick quiz` | `quiz` 同上 |
| `increase the sampling rate` | `sampling` 同上 |

> 这里用的是**否定环视**（`(?! [a-z0-9] )`）而不是简单子串匹配，因此只有独立的 `ui`/`ux` 词元才会命中。

### 关闭自动触发

**设置 → 插件 → UI/UX Pro Max 自动技能 → 关闭**

关闭后仅停用**自动注入**；以下方式仍然可用：

- `skill` 工具手动加载；
- `/ui-ux-pro-max` 手势；
- `~/.dsh/skills/` 下的技能本体不受影响。

---

## 🔧 命令与配置

### 技能本体命令

技能的搜索脚本仍可独立调用（插件不影响它）：

```bash
# 生成完整设计系统
python ~/.dsh/skills/ui-ux-pro-max/scripts/search.py \
  "beauty spa wellness service" --design-system -p "Serenity Spa"

# 按领域检索
python ~/.dsh/skills/ui-ux-pro-max/scripts/search.py "glassmorphism" --domain style
python ~/.dsh/skills/ui-ux-pro-max/scripts/search.py "elegant serif" --domain typography
python ~/.dsh/skills/ui-ux-pro-max/scripts/search.py "dashboard" --domain chart

# 按技术栈检索
python ~/.dsh/skills/ui-ux-pro-max/scripts/search.py "form validation" --stack react

# 持久化设计系统到项目
python ~/.dsh/skills/ui-ux-pro-max/scripts/search.py \
  "SaaS dashboard" --design-system --persist -p "MyApp" --output-dir "<项目根目录>"
```

> Windows 上用 `python`，不要用 `python3`（后者通常是应用商店占位符）。

### 自定义触发词

编辑 [`trigger.js`](trigger.js) 中的 `TRIGGER_PATTERNS` 数组即可：

```js
export const TRIGGER_PATTERNS = [
  /(^|[^a-z0-9])(ui|ux)(?![a-z0-9])/i,   // 独立 ui / ux
  /\bui[\s/_-]*ux\b/i,                   // UI/UX、ui-ux
  // 👇 在这里加你自己的触发词
  /\b我的产品线\b/,
  // ...
];
```

改完记得重启 DSH。

---

## 🧪 测试

项目自带 66 条断言，覆盖触发匹配与插件接线：

```bash
cd ~/.dsh/plugins/dsh-ui-ux-pro-max

node tests/test-trigger.mjs   # 47 条：触发词与来源隔离
node tests/test-plugin.mjs    # 19 条：pre-step 接线与失败路径
```

| 测试文件 | 断言数 | 覆盖内容 |
|---|---:|---|
| [`tests/test-trigger.mjs`](tests/test-trigger.mjs) | 47 | 正向触发、**反向不触发**、非用户来源隔离、非文本块、去重守卫 |
| [`tests/test-plugin.mjs`](tests/test-plugin.mjs) | 19 | 消息拼接、原消息保序、`reject` 透传、每轮仅一次、查询异常降级、`user-invocable` 策略、其它字段保留 |

两条测试**不依赖 DSH 运行时**，用纯 Node 即可跑（`trigger.js` 刻意不引入任何 Harness 包）。

---

## 📁 项目结构

```
dsh-ui-ux-pro-max/
├── index.js              # 宿主插件：agent/pre-step 监听器
├── trigger.js            # 触发词表与匹配逻辑（零 DSH 依赖，可单测）
├── cordis.patch.yml      # 把插件行注册进 Profile
├── package.json          # bundle 清单（dsh.bundle.patch / icon / exports）
├── icon.svg              # 插件列表里显示的图标
├── locale/
│   ├── zh.json           # 中文标题与描述
│   └── en.json           # 英文标题与描述
├── skills/               # 📦 内置的 7 个技能包（第三方，MIT，见声明）
│   ├── ui-ux-pro-max/    # 主体：79 风格 / 192 配色 / 74 字体配对 / 22 技术栈
│   ├── design/           # Logo、CIP、图标、社交图
│   ├── design-system/    # 设计令牌、幻灯片生成
│   ├── ui-styling/       # shadcn/ui + Tailwind
│   ├── brand/            # 品牌语汇与一致性
│   ├── banner-design/    # 横幅设计
│   └── slides/           # HTML 演示文稿
├── tests/
│   ├── test-trigger.mjs
│   └── test-plugin.mjs
├── THIRD-PARTY-NOTICES.md
├── CHANGELOG.md
├── LICENSE
└── README.md
```

### 核心文件说明

| 文件 | 作用 |
|---|---|
| [`index.js`](index.js) | 监听 `agent/pre-step`，命中后调用 `ctx.skills.get()` 并把技能正文注入当轮 |
| [`trigger.js`](trigger.js) | 触发词表 `TRIGGER_PATTERNS`、`matchTrigger()`、`alreadyInjected()`、降级渲染器 |
| [`cordis.patch.yml`](cordis.patch.yml) | 通过 `insert` 注册 `ui-ux-pro-max-auto` 插件行 |

---

## ❓ 常见问题

<details>
<summary><b>装了但没反应？</b></summary>

按顺序排查：

1. **技能本体装了吗？**
   ```bash
   ls ~/.dsh/skills/ui-ux-pro-max/SKILL.md
   ```
2. **`skill-filesystem` 提供者启用了吗？** 在「设置 → 插件」中确认它是开启状态（它是技能能被发现的**前提**，关闭时连内置技能也加载不了）。
3. **插件是 active 吗？** 应显示 `fiberPhase: "active"`。
4. **改过代码？** 需要**重启 DSH**——模块有缓存。
</details>

<details>
<summary><b>会不会很费 token？</b></summary>

只在**命中触发词的那一轮**注入一次。注入正文约 35–40k 字符（与官方 `/ui-ux-pro-max` 手势注入量相同）。普通编码对话不含 UI/UX 词，完全不受影响。嫌贵可在设置里关掉，或精简 `trigger.js` 的词表。
</details>

<details>
<summary><b>为什么不直接做成 skill，而要做插件？</b></summary>

skills 是**被动**的——需要模型主动调用。插件能监听事件、在模型决策**之前**介入，这正是「自动触发」所必需的。两者互补：技能提供知识，插件负责在正确的时机把它递过去。
</details>

<details>
<summary><b>支持其它技能吗？</b></summary>

可以。改 [`index.js`](index.js) 里的 `SKILL_NAME` 常量，并把 `trigger.js` 的词表换成目标技能的触发词即可。
</details>

---

## 🙏 致谢

- 技能本体（`skills/` 目录下的 7 个技能包）来自
  [nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill)，
  作者 Next Level Builder，MIT 许可证。**本仓库仅按其许可证再分发**，
  并做了最小化路径适配——详见 [THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md)；
- 插件机制参考 DSH 自带的 `cordis-plugin-development` 技能与 `tool-skill` 实现。

## 📄 许可证

- **本插件代码**（`index.js`、`trigger.js` 等）：[MIT](LICENSE)
- **`skills/` 目录**：第三方内容，MIT，版权归 Next Level Builder，
  条款见 [THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md)

---

<a id="english"></a>

## English

A **DeepSeek Harness (DSH) plugin** that automatically loads the
[ui-ux-pro-max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) skill
whenever your request mentions UI or UX work.

**The problem.** DSH's `skill` tool works, but only if the model decides to call
it. Ask for "a nicer UI" and it may just start coding — the 79 styles, 192
palettes, and 74 font pairings never get loaded.

**The fix.** This plugin listens on `agent/pre-step`, scans the turn's **direct
user input**, and splices the skill body into that same step. No manual
triggering, no relying on the model's memory.

It reuses the exact code path behind DSH's built-in `/skill-name` gesture, so
the injected body is durable in the session log, replayable, and rendered by the
host's own renderer.

### Install

The 7 skill packages are **bundled in this repo** (`skills/`, ~4.08 MB), so
installation is self-contained:

```bash
# 1. Clone the plugin
git clone https://github.com/bsfcxz/dsh-ui-ux-pro-max.git \
  ~/.dsh/plugins/dsh-ui-ux-pro-max

# 2. Install the bundled skills into the root DSH scans
mkdir -p ~/.dsh/skills
cp -r ~/.dsh/plugins/dsh-ui-ux-pro-max/skills/* ~/.dsh/skills/

# 3. Ask your DSH to install the bundle:
#    "Use plugin_manager install_bundle on
#     ~/.dsh/plugins/dsh-ui-ux-pro-max"
```

Prefer the upstream latest instead of the bundled snapshot?

```bash
npm install -g ui-ux-pro-max-cli
uipro init --ai universal           # writes ./.agents/skills/
mv .agents/skills/* ~/.dsh/skills/  # DSH scans this root
```

> Do **not** use `uipro init --ai universal --global`: it targets
> `~/.agents/skills/`, whose generated paths hardcode `python3`, which is
> unusable on Windows.

### Usage

Just talk normally — no command needed:

```
Build a UI for my SaaS dashboard
improve the ux of this form
Set up a design system
fix the responsive layout on mobile
```

Triggers include standalone `ui`/`ux`, `UI/UX`, `design system`,
`color palette`, `typography`, `accessibility audit`, and the Chinese
equivalents `界面` / `设计系统` / `配色方案` / `用户体验`.

Matching is boundary-aware: `build`, `guide`, `require`, `fluid`, and `quiz`
never trigger it. Only `source.kind === "user"` text is scanned, so model
output, tool results, and subagent text cannot forge a match.

### Toggle

**Settings → Plugins → UI/UX Pro Max Auto Skill**. Disabling stops only the
automatic injection; the `skill` tool and `/ui-ux-pro-max` still work.

### Tests

```bash
node tests/test-trigger.mjs   # 47 assertions
node tests/test-plugin.mjs    # 19 assertions
```

No DSH runtime required — `trigger.js` deliberately imports nothing from the
Harness.

### License

- **Plugin code** (`index.js`, `trigger.js`, …): [MIT](LICENSE)
- **`skills/` directory**: third-party content under MIT, © Next Level Builder.
  See [THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md).
