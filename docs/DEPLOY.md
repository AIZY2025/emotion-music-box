# 情绪音乐盒 - 部署文档

> 生成日期：2026-06-27  
> 阶段：⑤.5 /deploy

---

## 一、部署信息

| 项 | 值 |
|---|---|
| 平台 | GitHub Pages |
| URL | `https://aizy2025.github.io/emotion-music-box/` |
| 部署日期 | 2026-06-27 |
| GitHub 仓库 | `https://github.com/AIZY2025/emotion-music-box` |
| 项目类型 | 纯前端 Vite + React + TypeScript |
| 前端根目录 | `emotion-music-box/frontend` |
| 构建产物目录 | `emotion-music-box/frontend/dist` |
| 发布分支 | `gh-pages` |

---

## 二、选型理由

本项目是纯前端项目，没有 Flask、Node 后端和数据库。核心功能全部运行在浏览器中：Web Speech API、getUserMedia、Web Audio API、Canvas 2D 和 localStorage。

最终采用 GitHub Pages：代码已经托管在 GitHub，平台免费、公开访问稳定，适合初赛提交。由于源码在 `frontend/` 子目录，部署时先执行 Vite 构建，再把 `frontend/dist` 产物发布到 `gh-pages` 分支。

---

## 三、本地构建检查

```powershell
cd D:\file\情绪音乐盒\emotion-music-box\frontend
npm.cmd install
npm.cmd run build
```

期望结果：

```text
✓ built
```

---

## 四、访问和验收

线上地址：

```text
https://aizy2025.github.io/emotion-music-box/
```

健康检查：

```powershell
curl.exe -I https://aizy2025.github.io/emotion-music-box/
```

期望看到：

```text
HTTP/1.1 200 OK
```

浏览器手工验收：

1. 打开 `https://aizy2025.github.io/emotion-music-box/`。
2. 页面首屏应显示“情绪音乐盒”和可视化区域。
3. 点击右上角“开启面部识别”。
4. 允许摄像头和麦克风权限。
5. 说出当前心情。
6. 页面应自动生成情绪音乐卡并开始播放。
7. 页面底部“最近的情绪卡”应出现记录。

---

## 五、重新发布步骤

当前线上版本已发布。如果后续代码修改后需要重新发布，执行：

```powershell
cd D:\file\情绪音乐盒\emotion-music-box
npm.cmd --prefix frontend run build
git worktree add --detach ..\emotion-music-box-pages
```

进入临时发布目录：

```powershell
cd D:\file\情绪音乐盒\emotion-music-box-pages
git switch --orphan gh-pages
```

清空临时目录中除 `.git` 外的文件，把 `frontend/dist` 里的内容复制进去，再提交推送：

```powershell
git add .
git commit -m "🚀 deploy static site to GitHub Pages"
git push -f origin gh-pages
```

回到主项目并清理临时 worktree：

```powershell
cd D:\file\情绪音乐盒\emotion-music-box
git worktree remove ..\emotion-music-box-pages --force
```

---

## 六、GitHub Pages 设置

如果页面打不开或显示 404，在 GitHub 仓库中检查：

1. 打开仓库 `Settings`。
2. 进入 `Pages`。
3. `Source` 选择 `Deploy from a branch`。
4. `Branch` 选择 `gh-pages`。
5. 目录选择 `/ (root)`。
6. 保存后等待 1-3 分钟。

---

## 七、环境变量 / 敏感信息

本项目当前没有后端、数据库、Token 签名密钥和第三方 API Key，因此不需要配置环境变量。

| 变量 | 用途 | 存储位置 |
|---|---|---|
| 无 | 无 | 无 |

如果后续接入真实 AI API 或音乐 API，必须把密钥放到平台环境变量中，不要提交到 Git。

---

## 八、回滚方案

### 方案 1：回滚 `gh-pages` 分支

```powershell
cd D:\file\情绪音乐盒\emotion-music-box-pages
git log --oneline -5
git reset --hard GOOD_COMMIT_HASH
git push -f origin gh-pages
```

### 方案 2：重新发布 main 的上一个稳定版本

```powershell
cd D:\file\情绪音乐盒\emotion-music-box
git log --oneline -5
git checkout GOOD_COMMIT_HASH
npm.cmd --prefix frontend run build
```

然后按“重新发布步骤”把 `frontend/dist` 发布到 `gh-pages`。

---

## 九、常见错误

| 错误 | 原因 | 解决 |
|---|---|---|
| 页面 404 | GitHub Pages 没选 `gh-pages / root` | 进入 `Settings → Pages` 选择 `gh-pages` 分支 |
| 页面白屏 | Vite base 路径不对 | `frontend/vite.config.ts` 需要 `base: "/emotion-music-box/"` |
| 摄像头无法使用 | 权限被拒绝或浏览器不支持 | 使用 Chrome/Edge，允许摄像头权限 |
| 麦克风/语音无反应 | 浏览器不支持 Web Speech API | 使用 Chrome 或 Edge |
| 刷新后历史消失 | 浏览器清理了 localStorage | 使用普通窗口，不要用隐私模式 |
| Vercel 地址跳登录 | Vercel 开启了部署保护 | 本项目最终使用 GitHub Pages URL，不使用 Vercel URL |

---

## 十、版本历史

| 版本 | 日期 | 变更 | 作者 |
|---|---|---|---|
| v1.0 | 2026-06-27 | 首次生成部署文档 | AI-DevOps |
| v1.1 | 2026-06-27 | 更新为 GitHub Pages 真实部署地址 | AI-DevOps |
