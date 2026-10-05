# 内置技能包 / Bundled skills

本目录下的 7 个技能包**不是本项目原创**，而是再分发自上游 MIT 项目：

- **上游**：https://github.com/nextlevelbuilder/ui-ux-pro-max-skill
- **作者**：Next Level Builder
- **许可证**：MIT（版权 (c) 2024 Next Level Builder）

完整声明见 [../THIRD-PARTY-NOTICES.md](../THIRD-PARTY-NOTICES.md)。

## 为什么要内置

上游 CLI 生成的技能文件是**为 Claude Code 目录结构**准备的，直接放进
DSH 会因为路径与解释器名不对而无法使用。本仓库在再分发时做了三处最小化适配，
使它们开箱即可在 DSH 下工作：

| 适配项 | 改动 | 影响范围 |
|---|---|---|
| 技能路径 | `.claude/skills/` → `$HOME/.dsh/skills/` | 18 个文件，93 处 |
| 解释器名 | 命令示例中的 `python3` → `python` | Windows 兼容 |
| 跨技能解析 | `brand` 脚本改从 `__dirname` 解析兄弟技能路径 | 用户级安装下可正常工作 |

> 上游更新**不会**自动同步。要拿最新版，请按 README 的说明用
> `uipro init --ai universal` 重新安装，或直接覆盖本目录。

## 包含的技能

| 技能 | 文件数 | 体积 | 作用 |
|---|---:|---:|---|
| `ui-ux-pro-max` | 68 | 3.40 MB | 主体：79 种风格、192 套配色、74 组字体配对、25 种图表、22 个技术栈 |
| `design` | 35 | 0.23 MB | Logo、CIP、图标、社交图设计 |
| `design-system` | 27 | 0.17 MB | 三层设计令牌、组件规范、幻灯片生成 |
| `ui-styling` | 16 | 0.16 MB | shadcn/ui + Tailwind CSS |
| `brand` | 18 | 0.08 MB | 品牌语汇、视觉识别、资产校验 |
| `slides` | 6 | 0.02 MB | HTML 演示文稿 |
| `banner-design` | 2 | 0.01 MB | 社交/广告/印刷横幅 |

## 怎么用

复制到 DSH 扫描的技能根目录即可：

```bash
mkdir -p ~/.dsh/skills
cp -r ./skills/* ~/.dsh/skills/
```

DSH 会扫描四个根（按优先级）：`<项目>/.dsh/skills`、
`<项目>/.agents/skills`、`~/.dsh/skills`、`~/.agents/skills`。

技能自带独立的 Python 检索脚本（仅用标准库，无第三方依赖）：

```bash
python ~/.dsh/skills/ui-ux-pro-max/scripts/search.py "glassmorphism" --domain style
```

## 已剔除的内容

- `__pycache__/`、`*.pyc` 等字节码缓存；
- 上游仓库的开发脚手架（`cli/`、`.github/`、多语言 README 等）。
