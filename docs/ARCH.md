# 情绪音乐盒 - 系统架构设计文档（HLD）

> 生成日期：2026-06-27
> 阶段：② /hld
> 上游文档：PRD.md
> 下游文档：SDD.md + TEST.md

---

## 一、技术选型（带备选对比）

| 类别 | 选定方案 | 备选 1 | 备选 2 | 选定理由 |
|---|---|---|---|---|
| 前端框架 | **React 19 + TypeScript** | Vue 3 | 原生 HTML + JS | 组件化清晰，类型约束能减少初赛赶工错误，当前项目已初始化该栈 |
| 构建工具 | **Vite** | Webpack | Parcel | 启动快、配置少、适合纯前端 Demo 快速迭代 |
| UI 图标 | **lucide-react** | Iconify | 手写 SVG | 已在项目依赖中，图标统一且易用 |
| 情绪识别 | **浏览器能力 + 本地规则引擎** | face-api.js | 云端 AI API | 初赛优先稳定，不依赖网络和密钥；后续可替换为真实模型 |
| 声音输入 | **Web Speech API + 文本降级** | MediaRecorder 录音分析 | 云端语音识别 | Chrome/Edge 支持较好，失败时可直接回退文本输入 |
| 摄像头输入 | **MediaDevices.getUserMedia** | 上传图片识别 | 云端视频分析 | 浏览器原生支持，权限边界清晰，音视频不上传 |
| 音频播放 | **Web Audio API** | 预置 MP3 | Tone.js | 无版权风险，能实时合成短音景；不用引入额外音频库 |
| 动态可视化 | **Canvas 2D + CSS 动效** | SVG 动画 | Three.js | 轻量、可控、足够支撑声波和粒子效果 |
| 本地存储 | **localStorage** | IndexedDB | 后端数据库 | 数据量小、实现简单，符合无账号本地保存要求 |
| 部署 | **静态站点部署** | Node 服务部署 | 桌面应用打包 | Vite 构建产物可直接部署到 Netlify、Vercel、GitHub Pages 等平台 |

> 教学特别说明：本阶段以“初赛可展示、可稳定运行、学习成本低”为第一优先级，不追求真实 AI 识别精度和生产级音频生成。

---

## 二、系统架构图（ASCII）

```
┌─────────────────────────────────────────────────────────┐
│                    客户端 Browser                         │
│ React + TypeScript                                       │
│ 职责：页面渲染、交互状态、权限提示、结果展示、截图友好布局     │
└───────────────┬───────────────────────┬─────────────────┘
                │                       │
                ▼                       ▼
┌──────────────────────────┐   ┌──────────────────────────┐
│ 浏览器原生能力层           │   │ 本地数据层                 │
│ - Web Speech API          │   │ - localStorage            │
│ - getUserMedia            │   │ - 最近情绪音乐卡           │
│ - Web Audio API           │   │ - 用户偏好和生成记录       │
│ - Canvas 2D               │   └──────────────────────────┘
└───────────────┬──────────┘
                ▼
┌─────────────────────────────────────────────────────────┐
│                    前端业务服务层                         │
│ emotionAnalyzer：文本/面部/手动输入融合                    │
│ musicRecommender：AI 音乐参数推荐规则                      │
│ soundscapeEngine：短音景合成与播放控制                     │
│ visualizerEngine：声波/粒子可视化                          │
│ storageService：历史记录读写                               │
└─────────────────────────────────────────────────────────┘
```

---

## 三、模块划分

| 模块名 | 文件路径 | 职责 | 对外接口 |
|---|---|---|---|
| 应用入口 | `frontend/src/main.tsx` | 挂载 React 应用，加载全局样式 | 无 |
| 页面容器 | `frontend/src/App.tsx` | 管理主流程状态：输入、识别、生成、结果、历史 | `App` |
| 情绪输入组件 | `frontend/src/components/EmotionInput.tsx` | 文本输入、语音触发、手动情绪选择、强度选择 | `onInputChange()`、`onManualEmotion()` |
| 摄像头识别组件 | `frontend/src/components/FaceCapture.tsx` | 请求摄像头权限、展示预览、输出面部情绪结果 | `onFaceEmotionDetected()` |
| 结果卡组件 | `frontend/src/components/EmotionCard.tsx` | 展示情绪、音乐参数、虚拟曲目和情绪文案 | `EmotionCardProps` |
| 音频控制组件 | `frontend/src/components/AudioControls.tsx` | 播放、暂停、重新生成短音景 | `onPlay()`、`onPause()`、`onRegenerate()` |
| 可视化组件 | `frontend/src/components/Visualizer.tsx` | 根据情绪参数绘制声波和粒子动效 | `emotion`、`intensity`、`isPlaying` |
| 历史记录组件 | `frontend/src/components/HistoryPanel.tsx` | 展示 localStorage 中最近情绪卡 | `onSelectHistory()` |
| 情绪分析服务 | `frontend/src/services/emotionAnalyzer.ts` | 融合文本、面部、手动输入，输出最终情绪 | `analyzeEmotion()` |
| 音乐推荐服务 | `frontend/src/services/musicRecommender.ts` | 根据情绪生成 BPM、调式、音色、曲目和文案 | `recommendMusic()` |
| 短音景引擎 | `frontend/src/services/soundscapeEngine.ts` | 使用 Web Audio API 合成和控制声音 | `createSoundscape()`、`stopSoundscape()` |
| 存储服务 | `frontend/src/services/storageService.ts` | 读写、裁剪、清理本地历史记录 | `saveCard()`、`listCards()`、`clearCards()` |
| 类型定义 | `frontend/src/types.ts` | 定义 Emotion、MusicProfile、EmotionCard 等类型 | 类型导出 |
| 静态规则数据 | `frontend/src/data/emotionProfiles.ts` | 存放情绪与音乐参数映射表 | `emotionProfiles` |

---

## 四、数据模型（ER 图）

纯前端 Demo 不使用后端数据库，核心数据保存在浏览器 `localStorage` 中。数据关系如下：

```
EmotionInput(1) ──(1) EmotionResult ──(1) MusicProfile
       │                    │                  │
       │                    │                  └──(N) VirtualTrack
       │                    └──(1) VisualTheme
       └──(0..1) FaceSignal

EmotionCard(N) ── 保存到 ── localStorage["emotion_music_cards"]
```

### 4.1 核心数据结构设计

#### 结构名：EmotionInput
| 字段 | 类型 | 约束 | 含义 |
|---|---|---|---|
| text | string | 可空 | 用户输入或语音识别后的心情描述 |
| manualEmotion | EmotionType | 可空 | 用户手动选择的情绪 |
| intensity | number | 1-5 | 用户选择的情绪强度 |
| faceSignal | FaceSignal | 可空 | 摄像头识别到的面部情绪线索 |

#### 结构名：EmotionResult
| 字段 | 类型 | 约束 | 含义 |
|---|---|---|---|
| emotion | EmotionType | 必填 | 最终情绪：平静、开心、焦虑、低落、愤怒、期待 |
| intensity | number | 1-5 | 最终强度 |
| confidence | number | 0-1 | 结果置信度 |
| sources | string[] | 必填 | 参与判断的来源：文本、语音、面部、手动 |
| summary | string | 必填 | 面向用户展示的一句话解释 |

#### 结构名：MusicProfile
| 字段 | 类型 | 约束 | 含义 |
|---|---|---|---|
| bpm | number | 必填 | 节奏速度 |
| mode | string | 必填 | 调式或和声倾向 |
| timbre | string | 必填 | 主音色 |
| rhythmDensity | string | 必填 | 节奏密度 |
| tags | string[] | 至少 3 个 | 氛围标签 |
| tracks | VirtualTrack[] | 3 个 | 虚拟推荐曲目 |

#### 结构名：EmotionCard
| 字段 | 类型 | 约束 | 含义 |
|---|---|---|---|
| id | string | 唯一 | 本地生成 ID |
| createdAt | string | ISO 时间 | 生成时间 |
| input | EmotionInput | 必填 | 原始输入快照 |
| result | EmotionResult | 必填 | 情绪识别结果 |
| music | MusicProfile | 必填 | 音乐参数推荐 |
| visualTheme | VisualTheme | 必填 | 可视化颜色和动效配置 |

### 4.2 本地存储策略
- localStorage key 固定为 `emotion_music_cards`。
- 最多保存最近 12 张情绪音乐卡，超过后删除最旧记录。
- 本地记录不包含摄像头图像、录音文件或原始音视频数据。

### 4.3 索引策略
- 无数据库索引。
- 历史记录按 `createdAt` 倒序展示。
- `id` 使用时间戳加随机字符串生成，满足本地唯一即可。

---

## 五、接口契约清单（先列不写代码）

> 这一节是 SDD 阶段的输入，必须 100% 覆盖 PRD 中所有 P0 需求。纯前端项目无后端 HTTP API，因此这里定义“前端服务接口 + 浏览器能力接口”。

| 编号 | 类型 | 名称 | 权限 | 请求示例 | 响应示例 |
|---|---|---|---|---|---|
| API-001 | Browser | `startSpeechRecognition()` | 麦克风/语音识别权限 | `{"language":"zh-CN"}` | `{"ok":true,"text":"我今天有点焦虑"}` |
| API-002 | Browser | `startFaceCapture()` | 摄像头权限 | `{"video":true}` | `{"ok":true,"faceSignal":{"emotion":"焦虑","confidence":0.68}}` |
| API-003 | Service | `analyzeEmotion(input)` | 无 | `{"text":"有点累","manualEmotion":"低落","intensity":3}` | `{"emotion":"低落","intensity":3,"confidence":0.82,"sources":["文本","手动"]}` |
| API-004 | Service | `recommendMusic(result)` | 无 | `{"emotion":"低落","intensity":3}` | `{"bpm":72,"mode":"小调","timbre":"柔和电钢琴","tracks":[...]}` |
| API-005 | Service | `createSoundscape(profile)` | 用户点击后触发 | `{"bpm":72,"timbre":"柔和电钢琴"}` | `{"ok":true,"duration":15,"state":"playing"}` |
| API-006 | Service | `stopSoundscape()` | 无 | `{}` | `{"ok":true,"state":"stopped"}` |
| API-007 | Component | `renderVisualizer(theme)` | 无 | `{"emotion":"开心","intensity":4,"isPlaying":true}` | `{"ok":true,"frame":"canvas-updated"}` |
| API-008 | Service | `createEmotionCard(input,result,music)` | 无 | `{"input":{},"result":{},"music":{}}` | `{"id":"card_...","createdAt":"2026-06-27T..."}` |
| API-009 | Storage | `saveCard(card)` | 本地浏览器 | `{"id":"card_001","result":{"emotion":"平静"}}` | `{"ok":true,"count":1}` |
| API-010 | Storage | `listCards()` | 本地浏览器 | `{}` | `{"ok":true,"list":[...]}` |
| API-011 | Fallback | `getFallbackInput(reason)` | 无 | `{"reason":"camera_denied"}` | `{"mode":"manual","message":"可使用文本和手动情绪继续体验"}` |

### 5.1 统一响应格式
```json
{
  "ok": true,
  "code": 200,
  "msg": "操作成功",
  "data": {}
}
```

- `ok`: true 成功 / false 失败
- `code`: 200 成功 / 400 参数错误 / 401 权限未授权 / 404 能力不可用 / 500 执行异常
- `msg`: 面向用户或调试的简短说明
- `data`: 业务数据

### 5.2 统一错误码对照表
| code | 含义 | 触发场景 |
|---|---|---|
| 200 | 成功 | 业务正常完成 |
| 400 | 参数错误 | 缺少必要输入、强度越界、情绪类型不合法 |
| 401 | 权限未授权 | 用户拒绝摄像头或麦克风权限 |
| 404 | 能力不可用 | 当前浏览器不支持 Web Speech API、getUserMedia 或 Web Audio API |
| 500 | 执行异常 | 音频上下文创建失败、localStorage 写入失败、未知异常 |

---

## 六、本地开发流程

### 6.1 环境准备
```bash
# 1. 进入前端项目
cd frontend

# 2. 安装依赖
npm install
```

### 6.2 启动方式
```bash
npm run dev
# 浏览器访问命令行输出的本地地址，通常是 http://localhost:5173/
```

### 6.3 自测命令
```bash
# 类型检查和生产构建
npm run build

# 本地预览构建产物
npm run preview
```

### 6.4 浏览器手工验证
- 首次进入页面不应自动请求摄像头或麦克风权限。
- 点击声音输入后才请求相关权限；拒绝权限后应出现文本降级路径。
- 点击面部识别后才请求摄像头权限；拒绝权限后应出现手动选择路径。
- 生成情绪音乐卡后，可播放、暂停、重新生成短音景。
- 刷新页面后，最近生成记录仍可从本地历史区看到。

---

## 七、安全设计

| 风险 | 应对措施 |
|---|---|
| 摄像头/麦克风滥用 | 仅在用户点击后请求权限；页面明确展示权限用途；拒绝后提供降级路径 |
| 音视频隐私泄露 | 不上传、不保存原始摄像头画面和录音文件；仅保存结构化情绪结果 |
| XSS | 用户输入展示前进行文本转义；React 默认文本渲染不使用 `dangerouslySetInnerHTML` |
| 本地数据暴露 | localStorage 只保存情绪卡摘要，不保存敏感身份信息、音视频原始数据 |
| 浏览器能力不可用 | 对 Web Speech API、getUserMedia、Web Audio API 做能力检测和错误提示 |
| 版权风险 | 不播放真实版权音乐，只生成短音景和虚拟曲目名 |
| 误导性心理判断 | 页面文案声明情绪识别仅用于自我觉察和娱乐展示，不提供医疗诊断 |

---

## 八、版本历史

| 版本 | 日期 | 变更 | 作者 |
|---|---|---|---|
| v1.0 | 2026-06-27 | 初稿 | AI-SA |
