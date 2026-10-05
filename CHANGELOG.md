# Changelog

本项目的所有重要变更都会记录在此文件。

格式参考 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，
版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [1.0.0] - 2026-10-05

### 新增

- **自动触发**：监听 DSH `agent/pre-step` 事件，命中 UI/UX 关键词时把
  `ui-ux-pro-max` 技能正文注入当轮对话。
- **触发词表**（`trigger.js`）：
  - 独立 `ui` / `ux` 词元，含 `UI/UX`、`ui-ux`、`UI + UX` 等组合形式；
  - 设计术语：`design system`、`design tokens`、`color palette`、
    `font pairing`、`typography`、`responsive layout`、
    `accessibility audit`、`user interface`、`user experience`、
    `design review`；
  - 中文：`界面`、`设计系统`、`配色方案`、`排版`、`交互设计`、`用户体验`；
  - 名词复数（`color palettes`、`responsive layouts` 等）同样命中。
- **边界感知匹配**：使用否定环视，`build` / `guide` / `require` / `fluid` /
  `suite` / `quiz` 等词不会误触发。
- **来源隔离**：仅扫描 `source.kind === "user"` 的文本，模型输出、工具结果、
  注入上下文、子代理文本均无法伪造触发。
- **每轮去重**：`alreadyInjected()` 守卫确保同一轮内只注入一次。
- **失败安全**：技能注册表异常或技能缺失时静默放行并记录告警，不阻断对话。
- **策略遵循**：尊重技能自身的 `user-invocable` 设置。
- **降级渲染**：无法解析 DSH 宿主包时回退到本地渲染器，保证插件仍可加载。
- **插件元数据**：`icon.svg` 图标与 `locale/{zh,en}.json` 标题描述，
  可在「设置 → 插件」中查看与启停。
- **测试**：66 条断言（触发匹配 47 条 + 插件接线 19 条），纯 Node 即可运行。

### 说明

- 复用 DSH 内置 `/技能名` 手势的同一代码路径
  （`skill-invocation` 消息源），因此注入内容会持久化进会话日志，
  可回放、可 fork，并由官方渲染器输出。
- 本仓库**不包含** ui-ux-pro-max 技能的任何数据文件，技能需另行安装。

[1.0.0]: https://github.com/1357980024/dsh-ui-ux-pro-max/releases/tag/v1.0.0
