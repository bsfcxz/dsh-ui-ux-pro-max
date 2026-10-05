# 第三方许可声明 / Third-Party Notices

本仓库包含的 `skills/` 目录下的全部内容**并非本项目原创**，
而是来自第三方开源项目，按其原始许可证再分发。

## ui-ux-pro-max-skill

- **上游仓库**：https://github.com/nextlevelbuilder/ui-ux-pro-max-skill
- **作者**：Next Level Builder
- **许可证**：MIT
- **版权**：(c) 2024 Next Level Builder
- **本仓库包含**：`skills/` 下的 7 个技能包
  （`ui-ux-pro-max`、`ui-styling`、`design-system`、`design`、
  `brand`、`banner-design`、`slides`），共 172 个文件，约 4.08 MB。

### 与上游的差异

本仓库中的技能文件相对上游做了**最小化适配**，以便在
DeepSeek Harness 的目录结构下正常工作：

1. **路径重写**：`.claude/skills/` → `$HOME/.dsh/skills/`
   （含 `~/.claude/skills/` 形式），共 18 个文件、93 处；
2. **解释器名**：命令示例中的 `python3` → `python`
   （Windows 上 `python3` 通常是应用商店占位符，不可用）；
3. **跨技能路径**：`brand/scripts/sync-brand-to-tokens.cjs` 原先从
   当前工作目录解析兄弟技能脚本，改为从 `__dirname` 解析，
   使其在用户级安装下仍能工作。

除上述适配外未修改技能内容。**上游更新不会自动同步**，
如需最新版本请重新执行 `uipro init`。

### 未包含的内容

- 未包含 `.venv`、`__pycache__`、`*.pyc` 等构建/缓存产物；
- 未包含上游仓库的开发脚手架（`cli/`、`.github/` 等）。

## 本项目原创部分

以下文件由本项目作者编写，采用 MIT 许可证（见根目录 [LICENSE](../LICENSE)）：

- `index.js`
- `trigger.js`
- `cordis.patch.yml`
- `package.json`
- `icon.svg`
- `locale/`
- `tests/`
- `README.md`
- `CHANGELOG.md`

## MIT 许可证原文

上游项目采用 MIT 许可证，全文如下（与根目录 `LICENSE` 的条款一致）：

```
MIT License

Copyright (c) 2024 Next Level Builder

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
