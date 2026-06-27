# 情绪音乐盒 - 详细设计文档（SDD）

> 生成日期：2026-06-27
> 阶段：③ /sdd
> 上游：PRD.md + ARCH.md
> 下游：impl（代码实现）

---

## 〇、模块清单总览

| 模块 ID | 名称 | 文件路径 | 行数预估 |
|---|---|---|---|
| M-001 | 应用入口 | `frontend/src/main.tsx` | ~20 |
| M-002 | 页面容器 | `frontend/src/App.tsx` | ~180 |
| M-003 | 类型定义 | `frontend/src/types.ts` | ~90 |
| M-004 | 静态规则数据 | `frontend/src/data/emotionProfiles.ts` | ~180 |
| M-005 | 情绪输入组件 | `frontend/src/components/EmotionInput.tsx` | ~180 |
| M-006 | 摄像头识别组件 | `frontend/src/components/FaceCapture.tsx` | ~170 |
| M-007 | 情绪分析服务 | `frontend/src/services/emotionAnalyzer.ts` | ~140 |
| M-008 | 音乐推荐服务 | `frontend/src/services/musicRecommender.ts` | ~110 |
| M-009 | 短音景引擎 | `frontend/src/services/soundscapeEngine.ts` | ~180 |
| M-010 | 可视化组件 | `frontend/src/components/Visualizer.tsx` | ~170 |
| M-011 | 结果卡组件 | `frontend/src/components/EmotionCard.tsx` | ~130 |
| M-012 | 音频控制组件 | `frontend/src/components/AudioControls.tsx` | ~90 |
| M-013 | 历史记录组件 | `frontend/src/components/HistoryPanel.tsx` | ~120 |
| M-014 | 存储服务 | `frontend/src/services/storageService.ts` | ~90 |
| M-015 | 全局样式 | `frontend/src/styles.css` | ~420 |

---

## 一、模块 M-002 页面容器

### 1.1 接口签名
- `App()`：渲染单页应用。
- `handleGenerate()`：融合输入并生成情绪音乐卡。
- `handlePlay(card)`：播放当前卡片短音景。
- `handleStop()`：停止播放。
- `handleSelectHistory(card)`：从历史记录恢复卡片。

### 1.2 算法伪代码（handleGenerate）
```
输入：文本、手动情绪、强度、面部识别结果
1. 将当前界面状态切换为 generating
2. 调用 analyzeEmotion 得到最终情绪结果
3. 调用 recommendMusic 得到音乐参数和虚拟曲目
4. 根据情绪结果选择 visualTheme
5. 组装 EmotionCard，写入当前结果状态
6. 调用 saveCard 保存到 localStorage
7. 刷新历史记录列表
8. 将界面状态切换为 result
9. 如果任一步失败，展示降级提示并允许用户重试
```

### 1.3 流程图
```
开始
  ↓
收集输入
  ↓
情绪融合分析
  ↓
音乐参数推荐
  ↓
创建情绪音乐卡
  ↓
保存本地历史
  ↓
展示结果页
```

### 1.4 边界条件
- 输入全为空时，使用默认情绪“平静”，强度为 3，并提示用户可补充描述。
- 正在生成时再次点击生成按钮，只保留最后一次点击。
- localStorage 写入失败时，结果仍展示，只提示“历史记录保存失败”。
- 播放新卡片前必须停止旧音频。

---

## 二、模块 M-003 类型定义

### 2.1 接口签名
- `EmotionType`：`平静 | 开心 | 焦虑 | 低落 | 愤怒 | 期待`
- `EmotionInput`：文本、手动情绪、强度、面部信号。
- `EmotionResult`：最终情绪、强度、置信度、来源、解释。
- `MusicProfile`：BPM、调式、音色、节奏密度、标签、虚拟曲目。
- `EmotionCard`：本地 ID、时间、输入、情绪结果、音乐参数、视觉主题。

### 2.2 算法伪代码
```
1. 所有服务函数只接收和返回类型定义中的结构
2. 页面组件不得直接拼接临时对象字段
3. 新增字段必须先进入 types，再进入服务和组件
```

### 2.3 边界条件
- 情绪类型必须落在固定枚举内。
- 强度必须在 1 到 5 之间。
- 置信度必须在 0 到 1 之间。

---

## 三、模块 M-004 静态规则数据

### 3.1 接口签名
- `emotionProfiles`：按情绪类型索引的规则表。
- `getEmotionProfile(emotion)`：返回单个情绪规则。

### 3.2 算法伪代码
```
输入：emotion
1. 如果 emotion 存在于规则表，返回对应规则
2. 如果不存在，返回“平静”的规则
3. 规则包含音乐参数范围、视觉颜色、文案模板和虚拟曲目素材
```

### 3.3 边界条件
- 每个情绪必须配置 BPM 范围、调式、音色、颜色和至少 3 个标签。
- 每个情绪必须至少有 3 个虚拟曲目名。
- 文案模板为空时使用通用文案。

---

## 四、模块 M-005 情绪输入组件

### 4.1 接口签名
- 输入：`value`、`manualEmotion`、`intensity`、`speechState`
- 输出：`onTextChange(text)`、`onManualEmotion(emotion)`、`onIntensityChange(value)`、`onStartSpeech()`

### 4.2 算法伪代码（声音对话输入）
```
1. 用户点击语音按钮
2. 检查浏览器是否支持 Web Speech API
3. 如果不支持，切换为文本输入提示
4. 如果支持，请求语音识别
5. 识别到文本后写入 text
6. 识别失败时保留原文本，并显示错误提示
```

### 4.3 边界条件
- 用户拒绝麦克风或浏览器不支持时，不阻塞主流程。
- 识别文本超过 120 字时截断展示，保留前 120 字。
- 强度滑杆只能选择 1、2、3、4、5。

---

## 五、模块 M-006 摄像头识别组件

### 5.1 接口签名
- 输入：`enabled`、`currentSignal`
- 输出：`onFaceEmotionDetected(faceSignal)`、`onCameraError(reason)`

### 5.2 算法伪代码（面部情绪识别）
```
1. 用户点击开启面部识别
2. 检查 navigator.mediaDevices.getUserMedia 是否存在
3. 如果不存在，返回能力不可用
4. 请求 video 权限
5. 权限成功后展示摄像头预览
6. 每隔固定时间读取画面亮度和模拟表情线索
7. 按本地规则输出 faceSignal
8. 用户关闭识别时停止全部 video track
```

### 5.3 流程图
```
点击开启
  ↓
能力检测
  ↓
请求权限
  ↓
预览画面
  ↓
生成面部情绪线索
  ↓
回传给 App
```

### 5.4 边界条件
- 权限拒绝时进入手动情绪选择。
- 页面卸载或关闭组件时必须停止摄像头。
- 识别置信度低于 0.4 时仅作为弱信号。

---

## 六、模块 M-007 情绪分析服务

### 6.1 接口签名
- `analyzeEmotion(input) -> EmotionResult`

### 6.2 算法伪代码
```
输入：EmotionInput
1. 初始化每种情绪分数为 0
2. 如果有手动情绪，对该情绪加 4 分
3. 如果有文本，按关键词表给对应情绪加分
4. 如果有 faceSignal，按置信度给对应情绪加 0 到 3 分
5. 如果所有分数为 0，选择“平静”
6. 选择最高分情绪作为最终情绪
7. 强度优先使用用户强度；无强度时按分数换算为 1 到 5
8. 置信度按命中来源数量和最高分归一化计算
9. 返回 EmotionResult
```

### 6.3 边界条件
- 多个情绪同分时优先级：手动情绪 > 文本情绪 > 面部情绪 > 平静。
- 文本包含矛盾词时按命中次数累计，不做复杂自然语言推理。
- 输入缺失时不得抛异常。

---

## 七、模块 M-008 音乐推荐服务

### 7.1 接口签名
- `recommendMusic(result) -> MusicProfile`

### 7.2 算法伪代码
```
输入：EmotionResult
1. 读取最终情绪对应 emotionProfile
2. 根据 intensity 在 BPM 范围内插值
3. 选择调式、主音色和节奏密度
4. 从标签池中选择 3 到 5 个标签
5. 从曲目池中选择 3 个虚拟曲目
6. 生成一句情绪回应文案
7. 返回 MusicProfile
```

### 7.3 边界条件
- intensity 小于 1 按 1 处理，大于 5 按 5 处理。
- 情绪规则缺失时使用“平静”规则。
- 曲目不足 3 个时用通用曲目补足。

---

## 八、模块 M-009 短音景引擎

### 8.1 接口签名
- `createSoundscape(profile) -> SoundscapeHandle`
- `stopSoundscape() -> ServiceResult`

### 8.2 算法伪代码（createSoundscape）
```
输入：MusicProfile
1. 检查浏览器是否支持 AudioContext
2. 如果已有音频在播放，先停止
3. 在用户点击事件内创建或恢复 AudioContext
4. 根据 BPM 计算节拍间隔
5. 创建主音色振荡器、低频铺底和轻微噪声层
6. 使用 GainNode 控制淡入淡出
7. 按 10 到 20 秒规划音符触发
8. 开始播放并返回播放句柄
```

### 8.3 边界条件
- 非用户手势触发时不得自动播放。
- AudioContext 创建失败时返回能力不可用。
- 停止播放时必须释放所有 oscillator 和 timer。

---

## 九、模块 M-010 可视化组件

### 9.1 接口签名
- 输入：`emotion`、`intensity`、`isPlaying`、`theme`
- 输出：Canvas 帧绘制结果。

### 9.2 算法伪代码
```
1. 组件挂载后获取 canvas 上下文
2. 按容器尺寸设置 canvas 宽高
3. 根据 emotion 设置主色、辅色和背景色
4. 根据 intensity 设置粒子数量和波形高度
5. 如果 isPlaying 为 true，持续 requestAnimationFrame 绘制
6. 如果 isPlaying 为 false，绘制静态封面状态
7. 组件卸载时取消动画帧
```

### 9.3 边界条件
- canvas 上下文为空时显示 CSS 静态封面。
- 浏览器窗口变化时重新计算尺寸。
- 移动端粒子数量减半，避免卡顿。

---

## 十、模块 M-011 结果卡组件

### 10.1 接口签名
- 输入：`card`、`isPlaying`
- 输出：结果卡 UI。

### 10.2 算法伪代码
```
1. 展示情绪名称、强度和置信度
2. 展示 BPM、调式、音色、节奏密度
3. 展示 3 个虚拟曲目
4. 展示情绪回应文案
5. 根据 visualTheme 设置卡片视觉风格
```

### 10.3 边界条件
- card 为空时不渲染结果卡。
- 曲目缺失时显示“未命名音景”。
- 长文本必须换行，不得溢出卡片。

---

## 十一、模块 M-012 音频控制组件

### 11.1 接口签名
- 输入：`isPlaying`、`disabled`
- 输出：`onPlay()`、`onPause()`、`onRegenerate()`

### 11.2 算法伪代码
```
1. 如果无当前卡片，播放按钮禁用
2. 如果未播放，按钮显示播放
3. 点击播放后调用 createSoundscape
4. 如果正在播放，按钮显示暂停
5. 点击暂停后调用 stopSoundscape
6. 点击重新生成后停止旧声音并重新生成音乐参数
```

### 11.3 边界条件
- 快速连续点击时只执行最后一次状态切换。
- 音频播放失败时按钮恢复为未播放状态。
- 重新生成不能删除历史记录中的旧卡片。

---

## 十二、模块 M-013 历史记录组件

### 12.1 接口签名
- 输入：`cards`
- 输出：`onSelectHistory(card)`、`onClearHistory()`

### 12.2 算法伪代码
```
1. 从 App 接收历史卡片列表
2. 按 createdAt 倒序展示
3. 用户点击卡片时回传完整 card
4. 用户点击清空时调用存储服务清空
5. 空列表时展示空状态
```

### 12.3 边界条件
- 最多展示 12 条。
- 卡片数据损坏时跳过该条。
- 清空历史需要二次确认。

---

## 十三、模块 M-014 存储服务

### 13.1 接口签名
- `saveCard(card) -> ServiceResult`
- `listCards() -> EmotionCard[]`
- `clearCards() -> ServiceResult`

### 13.2 算法伪代码（saveCard）
```
输入：EmotionCard
1. 校验 card.id、createdAt、result、music 是否存在
2. 读取 localStorage 中的 emotion_music_cards
3. 如果解析失败，使用空数组
4. 将新卡片插入数组头部
5. 按 id 去重
6. 保留前 12 条
7. 写回 localStorage
8. 返回保存成功和当前数量
```

### 13.3 边界条件
- localStorage 不可用时返回失败，但不影响当前结果展示。
- JSON 解析失败时清理损坏数据。
- 单条记录过大时不保存音视频原始数据，只保存结构化摘要。

---

## 十四、全局业务流程

```
用户进入页面
  ↓
输入文本 / 开启语音 / 开启面部识别 / 手动选择情绪
  ↓
点击生成
  ↓
analyzeEmotion 融合情绪
  ↓
recommendMusic 推荐音乐参数
  ↓
createEmotionCard 生成结果卡
  ↓
saveCard 保存最近记录
  ↓
展示 Visualizer + EmotionCard + AudioControls
  ↓
用户播放短音景或查看历史
```

---

## 十五、版本历史

| 版本 | 日期 | 变更 | 作者 |
|---|---|---|---|
| v1.0 | 2026-06-27 | 初稿 | AI-TL |
