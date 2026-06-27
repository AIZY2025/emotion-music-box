# 情绪音乐盒 - 部署文档

> 生成日期：2026-06-27  
> 阶段：⑤.5 /deploy

---

## 一、部署信息

| 项 | 值 |
|---|---|
| 平台 | Vercel（推荐） |
| URL | 部署完成后填写，例如 `https://emotion-music-box.vercel.app` |
| 部署日期 | 2026-06-27 |
| GitHub 仓库 | 部署前填写你的仓库地址 |
| 项目类型 | 纯前端 Vite + React + TypeScript |
| 前端根目录 | `emotion-music-box/frontend` |
| 构建产物目录 | `emotion-music-box/frontend/dist` |

---

## 二、选型理由

本项目是纯前端项目，没有 Flask、Node 后端和数据库。核心功能全部运行在浏览器中：Web Speech API、getUserMedia、Web Audio API、Canvas 2D 和 localStorage。Vercel 对 Vite 项目支持直接，免费额度足够初赛展示，GitHub 登录后导入仓库即可部署。

GitHub Pages 也可用，但项目位于 `frontend/` 子目录，Pages 需要额外配置 GitHub Actions。Vercel 对子目录项目更省事，因此作为主方案。

---

## 三、本地部署前检查

在本机先确认项目可以生产构建。

```powershell
cd D:\file\情绪音乐盒\emotion-music-box\frontend
npm.cmd install
npm.cmd run build
```

期望结果：

```text
✓ built
```

本地预览生产构建：

```powershell
cd D:\file\情绪音乐盒\emotion-music-box\frontend
npm.cmd run preview
```

浏览器打开命令行输出的地址，通常是：

```text
http://localhost:4173/
```

---

## 四、部署步骤：Vercel（推荐）

### 4.1 把项目推送到 GitHub

如果还没有远程仓库，先在 GitHub 新建一个空仓库，然后执行：

```powershell
cd D:\file\情绪音乐盒\emotion-music-box
git status
git add .
git commit -m "🚀 /deploy：准备 Vercel 部署"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

如果已经配置过远程仓库，只执行：

```powershell
cd D:\file\情绪音乐盒\emotion-music-box
git status
git add .
git commit -m "🚀 /deploy：准备 Vercel 部署"
git push
```

### 4.2 在 Vercel 导入项目

1. 访问 `https://vercel.com/`
2. 使用 GitHub 账号登录。
3. 点击 `Add New...` → `Project`。
4. 选择你的 GitHub 仓库。
5. 点击 `Import`。

### 4.3 Vercel 项目配置

| 配置项 | 值 |
|---|---|
| Framework Preset | Vite |
| Root Directory | `frontend` |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm install` |

确认后点击 `Deploy`。

### 4.4 获取 URL

部署成功后，Vercel 会给出一个地址：

```text
https://YOUR_PROJECT.vercel.app
```

把这个地址填回本文档“一、部署信息”的 URL 字段。

---

## 五、访问和验收方式

### 5.1 首页健康检查

把 `YOUR_URL` 换成 Vercel 给你的真实地址。

```powershell
curl.exe -I https://YOUR_URL.vercel.app/
```

期望看到：

```text
HTTP/2 200
```

### 5.2 浏览器手工验收

1. 打开 `https://YOUR_URL.vercel.app/`。
2. 页面首屏应显示“情绪音乐盒”和可视化区域。
3. 点击右上角“开启面部识别”。
4. 允许摄像头和麦克风权限。
5. 说出当前心情。
6. 页面应自动生成情绪音乐卡并开始播放。
7. 页面底部“最近的情绪卡”应出现记录。

### 5.3 注意事项

摄像头和麦克风需要 HTTPS 或 localhost。Vercel 默认提供 HTTPS，因此线上地址可以正常请求权限。

---

## 六、环境变量 / 敏感信息

本项目当前没有后端、数据库、Token 签名密钥和第三方 API Key，因此不需要配置环境变量。

| 变量 | 用途 | 存储位置 |
|---|---|---|
| 无 | 无 | 无 |

如果后续接入真实 AI API 或音乐 API，必须把密钥放到平台环境变量中，不要提交到 Git。

---

## 七、回滚方案

### 方案 1：通过 Vercel UI 回滚

1. 打开 Vercel 项目。
2. 进入 `Deployments`。
3. 找到上一个可用版本。
4. 点击该版本右侧菜单。
5. 选择 `Promote to Production` 或 `Redeploy`。

### 方案 2：通过 Git 回滚

查看提交历史：

```powershell
cd D:\file\情绪音乐盒\emotion-music-box
git log --oneline -5
```

撤销最近一次提交并推送：

```powershell
cd D:\file\情绪音乐盒\emotion-music-box
git revert HEAD
git push
```

Vercel 会在 `git push` 后自动重新部署。

如果需要回到指定 commit：

```powershell
cd D:\file\情绪音乐盒\emotion-music-box
git checkout -b rollback-to-good-version GOOD_COMMIT_HASH
git push -u origin rollback-to-good-version
```

然后在 Vercel 中把该分支部署结果提升为生产版本。

---

## 八、备选方案：GitHub Pages

如果不想使用 Vercel，可以用 GitHub Actions 把 Vite 构建产物发布到 GitHub Pages。

### 8.1 新建工作流文件

在仓库根目录新建 `.github/workflows/deploy-pages.yml`：

```yaml
name: Deploy Frontend to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
          cache-dependency-path: frontend/package-lock.json

      - name: Install dependencies
        working-directory: frontend
        run: npm install

      - name: Build
        working-directory: frontend
        run: npm run build

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: frontend/dist

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### 8.2 提交并开启 Pages

```powershell
cd D:\file\情绪音乐盒\emotion-music-box
git add .github\workflows\deploy-pages.yml
git commit -m "🚀 /deploy：添加 GitHub Pages 部署流程"
git push
```

然后在 GitHub 仓库中：

1. 打开 `Settings` → `Pages`。
2. `Source` 选择 `GitHub Actions`。
3. 等待 Actions 跑完。
4. 访问页面给出的 URL。

---

## 九、常见错误

| 错误 | 原因 | 解决 |
|---|---|---|
| Vercel 找不到项目 | Root Directory 没填 `frontend` | 在项目设置里把 Root Directory 改为 `frontend` |
| 部署后白屏 | Output Directory 不正确 | Vercel Output Directory 填 `dist` |
| 构建失败 | 依赖未安装或 Node 版本过旧 | Vercel 默认 Node 20；本地先执行 `npm.cmd run build` |
| 摄像头无法使用 | 页面不是 HTTPS 或权限被拒绝 | 使用 Vercel HTTPS 地址，并在浏览器设置中允许摄像头 |
| 麦克风/语音无反应 | 浏览器不支持 Web Speech API | 使用 Chrome 或 Edge |
| 刷新后历史消失 | 浏览器清理了 localStorage | 使用普通窗口，不要用隐私模式 |

---

## 十、版本历史

| 版本 | 日期 | 变更 | 作者 |
|---|---|---|---|
| v1.0 | 2026-06-27 | 首次生成部署文档 | AI-DevOps |
