# 情绪音乐盒 - 功能解读文档

> 生成日期：2026-06-27  
> 阶段：⑤ /retro  
> 阅读对象：新加入项目的开发者、QA、用户

> **如何使用本文档**：先按“5 分钟跑起来”启动项目，再按用户故事顺序验证。本文档以当前代码为准，不描述未实现的后端、数据库或账号体系。

---

## 〇、5 分钟跑起来

```powershell
# 1. 进入前端项目目录
cd D:\file\情绪音乐盒\emotion-music-box\frontend

# 2. 安装依赖
npm.cmd install

# 3. 启动开发服务器
npm.cmd run dev

# 4. 打开命令行输出的地址
# 通常是 http://localhost:5173/
```

构建检查：

```powershell
cd D:\file\情绪音乐盒\emotion-music-box\frontend
npm.cmd run build
```

预览生产构建：

```powershell
cd D:\file\情绪音乐盒\emotion-music-box\frontend
npm.cmd run preview
```

常见前置条件：

| 项 | 要求 |
|---|---|
| 浏览器 | 推荐 Chrome 或 Edge |
| 摄像头 | 允许浏览器摄像头权限 |
| 麦克风 | 允许浏览器麦克风/语音识别权限 |
| 音频 | 浏览器标签页不要静音，系统音量打开 |

---

## 一、用户故事 US-001：通过声音说出此刻心情

### 1.1 PRD 描述

作为体验用户，我想要通过声音对话描述当前状态，以便系统理解我的情绪线索。

### 1.2 代码实现位置

- 页面编排：`frontend/src/App.tsx` → `startSpeechRecognition()`、`onBeforeStart`
- 输入展示：`frontend/src/components/EmotionInput.tsx`
- 类型定义：`frontend/src/vite-env.d.ts` → Web Speech API 类型声明

### 1.3 完整操作步骤

1. 打开页面。
2. 点击右上角悬浮摄像头卡片里的“开启面部识别”。
3. 浏览器请求权限时允许麦克风或语音识别。
4. 对电脑说出当前心情，例如“我现在有点焦虑，但也想快点完成”。
5. 页面左侧“说出此刻的心情”输入框会自动显示识别文本。
6. 输入框是只读的，不能手动编辑。

### 1.4 验证方法

- 输入框文字长度右侧计数会变化，例如 `12/120`。
- 自动状态从等待变为“正在自动生成并循环播放”。
- 识别结果会参与情绪卡生成。

### 1.5 常见错误

| 错误 | 原因 | 解决 |
|---|---|---|
| 没有识别文字 | 浏览器不支持 Web Speech API 或未授权 | 换 Chrome/Edge，刷新后重新允许权限 |
| 识别为空 | 说话太轻或环境太吵 | 靠近麦克风，重新点击开启识别 |
| 输入框不能打字 | 当前设计就是只读 | 通过语音识别写入，不支持手动输入 |

---

## 二、用户故事 US-002：通过摄像头生成面部情绪线索

### 2.1 PRD 描述

作为体验用户，我想要通过摄像头进行面部情绪识别，以便获得更直观的情绪判断结果。

### 2.2 代码实现位置

- 摄像头组件：`frontend/src/components/FaceCapture.tsx`
- 情绪规则：`frontend/src/data/emotionProfiles.ts`
- 主流程状态：`frontend/src/App.tsx` → `faceSignal`

### 2.3 完整操作步骤

1. 打开页面。
2. 点击右上角固定的“开启面部识别”。
3. 浏览器请求摄像头权限时选择允许。
4. 悬浮窗口内出现实时摄像头画面。
5. 组件每 1.6 秒读取一次画面亮度，生成一个面部情绪线索和置信度。

### 2.4 验证方法

- 右上角悬浮窗口应始终可见。
- 摄像头窗口顶部会显示当前识别到的情绪和百分比。
- 主区域会根据面部线索自动生成情绪音乐卡。

### 2.5 常见错误

| 错误 | 原因 | 解决 |
|---|---|---|
| 看不到画面 | 摄像头权限被拒绝或被其他软件占用 | 关闭占用摄像头的软件，刷新页面重新授权 |
| 浏览器提示不安全 | getUserMedia 需要安全上下文 | 使用 `localhost` 或 HTTPS 地址访问 |
| 识别情绪不准 | 当前是演示级亮度规则 | 初赛 Demo 用于展示流程，不是医学或心理诊断 |

---

## 三、用户故事 US-003：自动生成情绪音乐卡并播放音乐

### 3.1 PRD 描述

作为体验用户，我想要获得 AI 推荐的音乐参数和声音反馈，以便把当前情绪转化为可听见的反馈。

### 3.2 代码实现位置

- 情绪融合：`frontend/src/services/emotionAnalyzer.ts` → `analyzeEmotion()`
- 音乐推荐：`frontend/src/services/musicRecommender.ts` → `recommendMusic()`
- 自动生成：`frontend/src/App.tsx` → `handleGenerate(true)` 和自动触发 `useEffect`
- 情绪卡展示：`frontend/src/components/EmotionCard.tsx`

### 3.3 完整操作步骤

1. 点击“开启面部识别”。
2. 允许摄像头和语音相关权限。
3. 说出当前心情。
4. 等待约 1 秒。
5. 页面右侧自动出现情绪音乐卡。
6. 不需要点击情绪卡，也不需要点击播放按钮，系统会自动开始播放。

### 3.4 验证方法

- 情绪卡显示情绪名称、置信度、摘要和回应文案。
- 卡片显示 BPM、音色、节奏密度、调式和标签。
- 页面状态提示显示自动生成并循环播放。
- 可视化区域开始运动。

### 3.5 常见错误

| 错误 | 原因 | 解决 |
|---|---|---|
| 没有自动生成 | 没有拿到语音文本，也没有面部信号 | 重新开启面部识别，确认摄像头画面出现 |
| 情绪和预期不同 | 规则基于关键词和画面亮度综合判断 | 调整说话内容或情绪强度滑杆 |
| 历史一直新增 | 只有情绪变化才新增；同情绪会更新最新记录 | 这是当前设计，用于避免历史列表过长 |

---

## 四、用户故事 US-004：持续播放当前情绪的 5 首音乐循环

### 4.1 PRD 描述

作为体验用户，我希望音乐不要只响几秒，而是能持续播放；如果心情不变，就循环播放当前情绪下准备的 5 首音乐。

### 4.2 代码实现位置

- 曲目数据：`frontend/src/data/emotionProfiles.ts` → 每种情绪 `tracks` 5 条
- 音乐推荐：`frontend/src/services/musicRecommender.ts` → `tracks: profile.tracks.slice(0, 5)`
- 音频引擎：`frontend/src/services/soundscapeEngine.ts` → `scheduleTrackLoop()`
- 播放控制：`frontend/src/components/AudioControls.tsx`

### 4.3 完整操作步骤

1. 自动生成情绪卡后等待音乐开始。
2. 如果不手动暂停，音乐会持续播放。
3. 每 62 秒进入下一轮循环。
4. 同一种情绪会在内部 5 个虚拟曲目间循环变化。
5. 页面不会展示 5 首曲名，避免右侧音乐卡过长。

### 4.4 验证方法

- 点击播放/暂停按钮可以控制当前音频。
- 点击重新生成按钮会提升当前强度并生成新的音乐参数。
- 右侧卡片不显示 5 首曲名，只显示参数。

### 4.5 常见错误

| 错误 | 原因 | 解决 |
|---|---|---|
| 听不到声音 | 浏览器标签页静音、系统音量低、音频上下文未解锁 | 先点击“开启面部识别”，确认系统音量和浏览器标签页未静音 |
| 声音仍偏小 | Web Audio 合成不是播放真实歌曲 | 提高系统音量，或后续在 `soundscapeEngine.ts` 调整 master gain |
| 想看 5 首名称 | 当前按用户要求隐藏 | 曲目信息仍在 `emotionProfiles.ts`，仅内部使用 |

---

## 五、用户故事 US-005：查看最近情绪卡历史

### 5.1 PRD 描述

作为体验用户，我想要保存最近生成的情绪卡，以便回看自己的情绪变化。

### 5.2 代码实现位置

- 存储服务：`frontend/src/services/storageService.ts`
- 历史面板：`frontend/src/components/HistoryPanel.tsx`
- 主页面接入：`frontend/src/App.tsx` → `history`、`setHistory(listCards())`

### 5.3 完整操作步骤

1. 生成至少一张情绪音乐卡。
2. 页面底部“最近的情绪卡”会出现记录。
3. 每条记录包含情绪、日期时间、BPM、强度和置信度。
4. 如果连续生成的情绪相同，最新记录会被更新，不会新增一条。
5. 如果情绪变了，才新增一条历史记录。
6. 最多保存 12 条，列表区域内部滚动。

### 5.4 验证方法

- 刷新页面后历史记录仍在。
- 点击“清空”后弹出二次确认。
- 确认清空后历史列表为空。

### 5.5 常见错误

| 错误 | 原因 | 解决 |
|---|---|---|
| 同一情绪没有新增记录 | 当前设计要求情绪变化才新增 | 这是防止列表无限增长的优化 |
| 刷新后历史没了 | localStorage 被清理或浏览器隐私模式 | 换普通窗口，检查是否清理站点数据 |
| 点击历史后音乐没跟着切换 | 当前实现只恢复卡片 UI | REVIEW 中已标 P1，后续应同步播放对应音乐 |

---

## 六、用户故事 US-006：查看动态可视化和宠物阿狸互动

### 6.1 PRD 描述

作为体验用户，我想要看到动态音乐可视化和情绪陪伴反馈，以便更直观地感知当前生成结果。

### 6.2 代码实现位置

- 可视化：`frontend/src/components/Visualizer.tsx`
- 宠物阿狸：`frontend/src/components/PetAli.tsx`
- 样式动画：`frontend/src/styles.css`

### 6.3 完整操作步骤

1. 打开页面后，首屏右侧显示 Canvas 可视化区域。
2. 生成情绪卡并开始播放后，波形和粒子持续运动。
3. 页面左下角出现宠物阿狸。
4. 情绪变化时，宠物动画和文案会随情绪变化。
5. 点击宠物阿狸，可切换一句互动文案。

### 6.4 验证方法

- 播放时 Canvas 动画明显比静止状态更活跃。
- 宠物在不同情绪下有不同动画，如开心/期待跳动、焦虑轻微抖动。
- 移动端宽度下，摄像头和宠物会缩小并固定在屏幕底部区域。

---

## 七、核心工具函数解读

### 7.1 `analyzeEmotion(input)`：融合情绪线索

- **文件**：`frontend/src/services/emotionAnalyzer.ts`
- **作用**：把语音文本、面部信号、强度和可选手动情绪融合成最终情绪结果。
- **核心规则**：
  - 文本命中关键词时，对对应情绪加分。
  - 面部信号置信度大于等于 0.4 时，对对应情绪加分。
  - 没有有效线索时默认“平静”。
  - 强度被限制在 1-5。

### 7.2 `recommendMusic(result)`：生成音乐参数

- **文件**：`frontend/src/services/musicRecommender.ts`
- **作用**：根据最终情绪读取情绪配置，生成 BPM、调式、音色、节奏密度、标签、5 首虚拟曲目和回应文案。
- **核心规则**：
  - BPM 在情绪的 `bpmRange` 内按强度线性插值。
  - 强度大于等于 4 时展示更多标签。
  - 曲目固定取当前情绪的前 5 首。

### 7.3 `createSoundscape(profile)`：播放循环音乐

- **文件**：`frontend/src/services/soundscapeEngine.ts`
- **作用**：用 Web Audio API 创建振荡器、增益节点和压缩器，合成当前情绪音乐并循环播放。
- **核心规则**：
  - 播放新音乐前先停止旧音乐。
  - 每轮 62 秒。
  - 根据 BPM 计算音符间隔。
  - 根据音色关键词选择 `sine`、`triangle` 或 `sawtooth`。
  - 每轮结束后切换到下一首虚拟曲目的旋律偏移。

### 7.4 `saveCard(card)`：保存并去重历史

- **文件**：`frontend/src/services/storageService.ts`
- **作用**：把情绪卡写入 `localStorage["emotion_music_cards"]`。
- **核心规则**：
  - 数据不完整时返回 `code: 400`。
  - localStorage 数据损坏时自动清理。
  - 如果新卡情绪和最新记录相同，更新最新记录而不是新增。
  - 最多保留 12 条。

---

## 八、浏览器能力清单

| 能力 | 代码位置 | 用途 | 失败表现 |
|---|---|---|---|
| Web Speech API | `App.tsx` | 语音转文本 | 输入框没有语音结果 |
| getUserMedia | `FaceCapture.tsx` | 获取摄像头预览 | 悬浮窗口看不到视频 |
| Canvas 2D | `FaceCapture.tsx`、`Visualizer.tsx` | 采样亮度和绘制可视化 | 无法生成面部线索或可视化为空 |
| Web Audio API | `soundscapeEngine.ts` | 合成音乐并播放 | 播放失败或无声音 |
| localStorage | `storageService.ts` | 保存最近情绪卡 | 刷新后没有历史 |

---

## 九、可复制验证命令

```powershell
# 查看源码文件
cd D:\file\情绪音乐盒\emotion-music-box
rg --files frontend/src
```

```powershell
# 统计源码行数
cd D:\file\情绪音乐盒\emotion-music-box
Get-ChildItem -Path frontend\src -Recurse -File | ForEach-Object {
  $count = (Get-Content $_.FullName | Measure-Object -Line).Lines
  "$($_.FullName): $count"
}
```

```powershell
# 生产构建
cd D:\file\情绪音乐盒\emotion-music-box\frontend
npm.cmd run build
```

---

## 十、版本历史

| 版本 | 日期 | 变更 | 作者 |
|---|---|---|---|
| v1.0 | 2026-06-27 | 基于当前代码生成功能解读 | AI-Technical-Writer |
