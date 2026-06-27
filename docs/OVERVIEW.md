# 情绪音乐盒 - 架构复盘文档

> 生成日期：2026-06-27  
> 阶段：⑤ /retro  
> 阅读对象：新加入项目的开发者、Code Reviewer、技术 Leader

---

## 一、实际架构图（基于代码重画）

```text
┌─────────────────────────────────────────────────────────────┐
│ Browser / Vite Dev Server                                    │
│ frontend/index.html                                          │
│   └── src/main.tsx                                           │
│       └── src/App.tsx                                        │
│           ├── components/EmotionInput.tsx                    │
│           ├── components/FaceCapture.tsx                     │
│           ├── components/EmotionCard.tsx                     │
│           ├── components/AudioControls.tsx                   │
│           ├── components/Visualizer.tsx                      │
│           ├── components/HistoryPanel.tsx                    │
│           └── components/PetAli.tsx                          │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ Frontend Service Layer                                       │
│ src/data/emotionProfiles.ts                                  │
│   └── 六类情绪的关键词、音乐参数、颜色主题、5 首虚拟曲目       │
│ src/services/emotionAnalyzer.ts                              │
│   └── 融合语音文本 + 面部线索 + 强度，输出 EmotionResult      │
│ src/services/musicRecommender.ts                             │
│   └── 根据情绪结果生成 BPM、调式、音色、标签、曲目和回应文案  │
│ src/services/soundscapeEngine.ts                             │
│   └── Web Audio API 合成并循环播放情绪音乐                   │
│ src/services/storageService.ts                               │
│   └── localStorage 读写最近情绪卡                            │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ Browser Native Capabilities                                  │
│ Web Speech API       ← 语音识别文本                          │
│ getUserMedia         ← 摄像头画面预览                         │
│ Canvas 2D            ← 面部亮度采样 + 音乐可视化              │
│ Web Audio API        ← Oscillator/Gain/Compressor 合成音景    │
│ localStorage         ← emotion_music_cards                   │
└─────────────────────────────────────────────────────────────┘
```

项目没有后端、数据库和真实音乐版权内容。所有情绪分析、音乐参数推荐、声音合成、可视化和历史记录都在浏览器本地完成。

---

## 二、实际技术选型 vs ARCH.md 设计

| 类别 | ARCH.md 设计 | 实际实现 | 差异原因 |
|---|---|---|---|
| 前端框架 | React 19 + TypeScript | React + TypeScript | 一致，版本由 `package-lock.json` 锁定 |
| 构建工具 | Vite | Vite | 一致 |
| 图标 | lucide-react | lucide-react | 一致 |
| 情绪识别 | 浏览器能力 + 本地规则引擎 | Web Speech API + 摄像头亮度规则 + 关键词规则 | 一致，但面部识别为演示级模拟 |
| 声音输入 | Web Speech API + 文本降级 | 点击面部识别时自动启动 Web Speech API，文本框只读 | 用户后续要求去掉手动语音按钮和手动输入 |
| 摄像头输入 | getUserMedia | getUserMedia + 固定悬浮摄像头窗口 | 用户后续要求像视频通话一样始终可见 |
| 音频播放 | Web Audio API 生成 10-20 秒短音景 | Web Audio API 生成 62 秒循环段，并在 5 首虚拟曲目间循环 | 用户后续要求音乐一直播放 |
| 动态可视化 | Canvas 2D + CSS | Canvas 2D + CSS | 一致 |
| 本地存储 | localStorage | localStorage，最多 12 条，情绪未变化时更新最新记录 | 一致，并按用户要求优化历史增长 |
| 宠物互动 | 未定义 | `PetAli` 固定在左下角，根据情绪变化展示动画和文案 | 用户后续新增需求 |
| 部署形态 | 静态站点部署 | Vite 静态前端，可 `npm run build` 输出 `dist` | 一致 |

---

## 三、模块清单（实际文件路径）

| 模块名 | 文件路径 | 行数 | 职责 | 入口函数/导出 |
|---|---:|---:|---|---|
| 应用入口 | `frontend/src/main.tsx` | 9 | 挂载 React 应用并加载全局样式 | `ReactDOM.createRoot()` |
| 页面容器 | `frontend/src/App.tsx` | 213 | 编排语音、面部识别、生成、播放、历史和宠物状态 | `App()` |
| 全局样式 | `frontend/src/styles.css` | 730 | 页面布局、卡片、悬浮摄像头、宠物阿狸、响应式样式 | CSS class |
| 类型定义 | `frontend/src/types.ts` | 67 | 定义情绪、输入、识别结果、音乐参数、卡片和服务返回类型 | `EmotionType` 等 |
| Vite 类型扩展 | `frontend/src/vite-env.d.ts` | 39 | 补充 Web Speech API、AudioContext 兼容类型 | 全局类型声明 |
| 情绪规则数据 | `frontend/src/data/emotionProfiles.ts` | 109 | 六类情绪的关键词、BPM 范围、音色、主题、5 首虚拟曲目 | `emotionProfiles`、`getEmotionProfile()` |
| 情绪分析服务 | `frontend/src/services/emotionAnalyzer.ts` | 58 | 根据语音文本、面部线索和强度计算最终情绪 | `analyzeEmotion()` |
| 音乐推荐服务 | `frontend/src/services/musicRecommender.ts` | 21 | 根据情绪输出音乐参数和回应文案 | `recommendMusic()` |
| 音景引擎 | `frontend/src/services/soundscapeEngine.ts` | 180 | Web Audio 合成、循环播放、停止和音频解锁 | `createSoundscape()`、`stopSoundscape()`、`unlockAudio()` |
| 存储服务 | `frontend/src/services/storageService.ts` | 47 | localStorage 读写、去重、清空、坏数据清理 | `saveCard()`、`listCards()`、`clearCards()` |
| 情绪输入组件 | `frontend/src/components/EmotionInput.tsx` | 51 | 展示语音识别后的只读文本、强度滑杆和自动生成状态 | `EmotionInput()` |
| 面部识别组件 | `frontend/src/components/FaceCapture.tsx` | 98 | 请求摄像头、预览画面、采样亮度并输出情绪线索 | `FaceCapture()` |
| 情绪卡组件 | `frontend/src/components/EmotionCard.tsx` | 29 | 展示最终情绪、置信度、摘要、回应和音乐参数 | `EmotionCard()` |
| 音频控制组件 | `frontend/src/components/AudioControls.tsx` | 21 | 播放/暂停和重新生成音乐参数 | `AudioControls()` |
| 可视化组件 | `frontend/src/components/Visualizer.tsx` | 58 | Canvas 绘制波形柱和粒子动画 | `Visualizer()` |
| 历史记录组件 | `frontend/src/components/HistoryPanel.tsx` | 47 | 展示最近 12 条情绪卡并支持清空 | `HistoryPanel()` |
| 宠物阿狸组件 | `frontend/src/components/PetAli.tsx` | 45 | 固定宠物形象、按情绪切换动画和互动文案 | `PetAli()` |

---

## 四、关键设计决策（Why 文档）

### 4.1 为什么做成纯前端 Demo？

初赛作品重点是“能打开、能体验、能截图、能说明”，纯前端可以避开账号、服务器、数据库和部署环境的不确定性。摄像头、语音识别、音频合成和本地存储都能在浏览器完成，足够支撑当前产品闭环。

### 4.2 为什么用本地规则而不接真实 AI 模型？

项目目标是初赛可演示，不是医疗级或生产级情绪识别。关键词、摄像头亮度和强度滑杆的规则组合可控、无密钥、无网络依赖，评审打开页面后能立即看到稳定结果。

### 4.3 为什么点击面部识别时自动启动语音？

用户后续明确要求删除声音对话按钮，降低操作路径。当前把 `unlockAudio()` 和 `startSpeechRecognition()` 挂在 `FaceCapture.onBeforeStart`，让一次点击同时满足浏览器权限触发、音频解锁和语音采集。

### 4.4 为什么摄像头做成固定悬浮窗口？

用户希望面部情绪线索像视频通话一样一直可见。固定悬浮窗口让用户在查看情绪卡、音乐播放卡和历史记录时仍能确认摄像头状态，也避免它在主内容布局中挤压卡片高度。

### 4.5 为什么音乐用 Web Audio 合成而不是播放真实歌曲？

PRD 明确不做真实版权音乐播放。Web Audio API 可以实时生成节奏、旋律和铺底音，不需要音频文件、不涉及版权，也能按 BPM、音色和强度参数即时变化。

### 4.6 为什么同一种情绪不新增历史记录？

用户反馈历史卡越来越多会拉长页面。当前 `saveCard()` 会比较最新记录的情绪，如果新卡与最新情绪相同，就复用最新记录的 `id` 和 `createdAt` 更新内容；只有情绪变化时才新增一条记录。

### 4.7 为什么隐藏 5 首曲目名称但仍保留 tracks？

用户要求右侧音乐卡片不要展示 5 首名称，但又要求每种心情准备 5 首音乐并循环播放。因此 `MusicProfile.tracks` 继续作为内部循环素材，`EmotionCard` 只展示 BPM、音色、节奏、调式和标签。

---

## 五、与 SDD.md 的偏差清单

| 偏差项 | SDD 设计 | 实际实现 | 是否影响 P0 功能 |
|---|---|---|---|
| 输入方式 | 文本可输入、可手动选择情绪、可点击语音按钮 | 文本框只读，仅展示语音识别结果；无手动情绪卡；点击面部识别时自动启动语音 | 不影响，符合用户后续需求 |
| 音频长度 | 10-20 秒短音景 | 62 秒一轮，并在同一情绪 5 首虚拟曲目间持续循环 | 不影响，符合用户后续需求 |
| 曲目展示 | 情绪卡展示 3 个虚拟曲目 | 情绪卡不展示曲目名称，曲目仅用于内部循环 | 不影响，符合用户后续需求 |
| 历史点击 | `handleSelectHistory(card)` 恢复历史卡 | 实际直接 `setCurrentCard`，不会自动切换正在播放的音乐 | 影响一致性，已在 REVIEW 标为 P1 |
| 面部识别位置 | 普通页面组件 | 固定悬浮在右上角/移动端右下角 | 不影响，符合用户后续需求 |
| 宠物互动 | 未定义 | 新增 `PetAli` 情绪宠物 | 不影响，是范围扩展 |
| 语音/摄像头降级 | 权限失败可手动文本和手动情绪继续 | 文本框只读，错误提示仍提到手动文本输入 | 不阻塞核心演示，但文案和降级路径需修正 |
| 自动生成防抖 | 快速触发时只保留最后一次 | 当前有签名去重，但生成内部仍有延迟闭包，极端情况下可能旧结果覆盖新结果 | 不阻塞演示，已在 REVIEW 标为 P1 |

---

## 六、可改进项（按 ROI 排序）

| 改进项 | 优先级 | 工作量 | 收益 |
|---|---|---:|---|
| 历史卡片点击后同步切换并播放对应音乐 | 高 | 0.5 小时 | 消除“看到 A 情绪、听到 B 音乐”的不一致 |
| 给自动生成增加最后一次任务保护 | 高 | 1 小时 | 减少摄像头连续刷新导致的重复生成和播放跳变 |
| 清理音频循环中的已结束 oscillator/timer 引用 | 高 | 1 小时 | 提升长时间播放稳定性 |
| 修正摄像头/语音失败提示文案 | 中 | 0.2 小时 | 避免提示用户去执行已被禁用的手动输入 |
| 固定依赖版本范围 | 中 | 0.2 小时 | 提高换机安装和评审复现稳定性 |
| 给核心服务补 Vitest 单元测试 | 中 | 1.5 小时 | 降低情绪分析、音乐推荐和历史去重的回归风险 |
| 将 App 中的流程编排拆成自定义 hooks | 低 | 2 小时 | 降低 `App.tsx` 复杂度，方便后续维护 |
| 把面部识别替换为真实表情模型 | 低 | 0.5-1 天 | 提升识别可信度，但会增加模型体积和兼容成本 |

---

## 七、版本历史

| 版本 | 日期 | 变更 | 作者 |
|---|---|---|---|
| v1.0 | 2026-06-27 | 基于当前代码生成架构复盘 | AI-Architect |
