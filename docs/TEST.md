# 情绪音乐盒 - 测试用例文档

> 生成日期：2026-06-27
> 阶段：③ /sdd
> 上游：SDD.md

> 使用说明：本项目是纯前端 Demo，没有后端 HTTP API。所有用例都给出可复制执行的 curl，用于确认 Vite 页面可访问；浏览器能力和前端服务逻辑按 Given-When-Then 手工验证。
> 测试前请确认服务已启动：`cd frontend && npm run dev`

---

## 〇、测试环境

| 项 | 值 |
|---|---|
| 服务地址 | http://localhost:5173 |
| 测试工具 | curl / Chrome DevTools / Edge DevTools |
| 测试浏览器 | Chrome 或 Edge 最新版 |
| 测试顺序 | 先页面可访问，再测输入、识别、生成、播放、历史 |

公共 curl：
```bash
curl -I http://localhost:5173/
```
预期：HTTP 200，返回 `Content-Type: text/html`。

---

## 一、API-001 startSpeechRecognition

### TC-001-01 正常：支持语音识别
- Given：使用 Chrome/Edge，页面已打开。
- When：点击声音输入并允许权限，说出“我今天有点焦虑”。
- Then：文本框出现识别文本，语音状态回到空闲。
```bash
curl -I http://localhost:5173/
```

### TC-001-02 边界：浏览器不支持
- Given：模拟 `SpeechRecognition` 不存在。
- When：点击声音输入。
- Then：显示文本输入降级提示，主流程可继续。
```bash
curl -I http://localhost:5173/
```

### TC-001-03 异常：用户拒绝权限
- Given：浏览器弹出权限请求。
- When：用户拒绝麦克风权限。
- Then：显示“可改用文字描述”的提示，不产生崩溃。
```bash
curl -I http://localhost:5173/
```

---

## 二、API-002 startFaceCapture

### TC-002-01 正常：允许摄像头
- Given：设备有摄像头。
- When：点击面部识别并允许权限。
- Then：页面出现视频预览，并输出一个面部情绪线索。
```bash
curl -I http://localhost:5173/
```

### TC-002-02 边界：无摄像头设备
- Given：设备无摄像头或浏览器无法枚举摄像头。
- When：点击面部识别。
- Then：显示能力不可用，并提供手动情绪选择。
```bash
curl -I http://localhost:5173/
```

### TC-002-03 异常：拒绝摄像头权限
- Given：浏览器弹出摄像头权限。
- When：用户拒绝。
- Then：视频预览不显示，页面提示降级路径。
```bash
curl -I http://localhost:5173/
```

---

## 三、API-003 analyzeEmotion

### TC-003-01 正常：文本 + 手动情绪
- Given：文本为“最近压力很大”，手动情绪为“焦虑”，强度 4。
- When：点击生成。
- Then：最终情绪为焦虑，来源包含文本和手动，强度为 4。
```bash
curl -I http://localhost:5173/
```

### TC-003-02 边界：输入为空
- Given：文本为空、未开启面部识别、未手动选择。
- When：点击生成。
- Then：默认生成“平静”结果，强度为 3。
```bash
curl -I http://localhost:5173/
```

### TC-003-03 异常：强度越界
- Given：通过调试工具把强度改成 9。
- When：点击生成。
- Then：强度被裁剪到 5，不抛异常。
```bash
curl -I http://localhost:5173/
```

---

## 四、API-004 recommendMusic

### TC-004-01 正常：低落情绪
- Given：情绪结果为低落，强度 3。
- When：生成音乐参数。
- Then：BPM 偏低，调式偏小调，包含 3 首虚拟曲目。
```bash
curl -I http://localhost:5173/
```

### TC-004-02 边界：强度为 1
- Given：情绪为开心，强度 1。
- When：生成音乐参数。
- Then：BPM 取开心范围低位，节奏密度不应过高。
```bash
curl -I http://localhost:5173/
```

### TC-004-03 异常：未知情绪
- Given：通过调试工具传入未知情绪。
- When：生成音乐参数。
- Then：使用“平静”规则兜底。
```bash
curl -I http://localhost:5173/
```

---

## 五、API-005 createSoundscape

### TC-005-01 正常：用户点击播放
- Given：已生成情绪音乐卡。
- When：点击播放按钮。
- Then：播放 10-20 秒短音景，可视化进入播放态。
```bash
curl -I http://localhost:5173/
```

### TC-005-02 边界：重复点击播放
- Given：短音景正在播放。
- When：连续点击播放/暂停 3 次。
- Then：最终状态与按钮一致，不叠加多个声音。
```bash
curl -I http://localhost:5173/
```

### TC-005-03 异常：Web Audio 不可用
- Given：模拟 `AudioContext` 不存在。
- When：点击播放。
- Then：提示当前浏览器不支持音频播放，页面不崩溃。
```bash
curl -I http://localhost:5173/
```

---

## 六、API-006 stopSoundscape

### TC-006-01 正常：停止播放
- Given：短音景正在播放。
- When：点击暂停。
- Then：声音停止，按钮恢复为播放。
```bash
curl -I http://localhost:5173/
```

### TC-006-02 边界：未播放时停止
- Given：当前没有音频播放。
- When：触发停止逻辑。
- Then：返回成功空操作，不报错。
```bash
curl -I http://localhost:5173/
```

### TC-006-03 异常：音频句柄已释放
- Given：音频已经自然结束。
- When：再次点击暂停。
- Then：状态保持停止，不出现控制台错误。
```bash
curl -I http://localhost:5173/
```

---

## 七、API-007 renderVisualizer

### TC-007-01 正常：播放态动效
- Given：情绪为开心，强度 4，isPlaying 为 true。
- When：渲染可视化。
- Then：声波或粒子持续运动，颜色匹配开心主题。
```bash
curl -I http://localhost:5173/
```

### TC-007-02 边界：移动端宽度
- Given：浏览器宽度为 375px。
- When：展示结果页。
- Then：可视化不遮挡按钮和文字。
```bash
curl -I http://localhost:5173/
```

### TC-007-03 异常：Canvas 上下文为空
- Given：模拟 canvas 获取上下文失败。
- When：渲染可视化。
- Then：显示静态封面兜底。
```bash
curl -I http://localhost:5173/
```

---

## 八、API-008 createEmotionCard

### TC-008-01 正常：生成完整卡片
- Given：输入、情绪结果、音乐参数都有效。
- When：点击生成。
- Then：结果卡包含情绪、强度、BPM、音色、3 首虚拟曲目。
```bash
curl -I http://localhost:5173/
```

### TC-008-02 边界：文本很长
- Given：输入 120 字以上文本。
- When：生成卡片。
- Then：展示文本不溢出，卡片布局稳定。
```bash
curl -I http://localhost:5173/
```

### TC-008-03 异常：音乐参数缺失
- Given：通过调试工具传入缺失曲目的音乐参数。
- When：生成卡片。
- Then：使用“未命名音景”兜底。
```bash
curl -I http://localhost:5173/
```

---

## 九、API-009 saveCard

### TC-009-01 正常：保存历史
- Given：生成一张情绪音乐卡。
- When：保存到 localStorage。
- Then：刷新页面后历史区仍能看到该卡。
```bash
curl -I http://localhost:5173/
```

### TC-009-02 边界：超过 12 条
- Given：连续生成 13 张卡片。
- When：查看历史记录。
- Then：只保留最近 12 条，最旧记录被移除。
```bash
curl -I http://localhost:5173/
```

### TC-009-03 异常：localStorage 不可写
- Given：浏览器隐私设置导致 localStorage 写入失败。
- When：生成卡片。
- Then：结果正常展示，并提示历史保存失败。
```bash
curl -I http://localhost:5173/
```

---

## 十、API-010 listCards

### TC-010-01 正常：读取历史
- Given：localStorage 中已有 3 张卡。
- When：打开页面。
- Then：历史区按时间倒序展示 3 张卡。
```bash
curl -I http://localhost:5173/
```

### TC-010-02 边界：历史为空
- Given：清空 localStorage。
- When：打开页面。
- Then：显示空状态，不显示错误。
```bash
curl -I http://localhost:5173/
```

### TC-010-03 异常：历史 JSON 损坏
- Given：手动把 `emotion_music_cards` 写成非法 JSON。
- When：刷新页面。
- Then：损坏数据被忽略或清理，页面可继续使用。
```bash
curl -I http://localhost:5173/
```

---

## 十一、API-011 getFallbackInput

### TC-011-01 正常：摄像头拒绝降级
- Given：用户拒绝摄像头权限。
- When：触发降级逻辑。
- Then：页面提示可用文本和手动情绪继续体验。
```bash
curl -I http://localhost:5173/
```

### TC-011-02 边界：语音和摄像头都不可用
- Given：浏览器同时不支持语音和摄像头。
- When：进入输入区。
- Then：保留文本输入、手动情绪和强度选择。
```bash
curl -I http://localhost:5173/
```

### TC-011-03 异常：未知降级原因
- Given：传入未知 reason。
- When：生成降级提示。
- Then：显示通用提示“当前能力不可用，可继续手动输入”。
```bash
curl -I http://localhost:5173/
```

---

## 十二、覆盖率矩阵

| 接口 | 正常用例 | 边界用例 | 异常用例 | 总数 |
|---|---:|---:|---:|---:|
| API-001 startSpeechRecognition | 1 | 1 | 1 | 3 |
| API-002 startFaceCapture | 1 | 1 | 1 | 3 |
| API-003 analyzeEmotion | 1 | 1 | 1 | 3 |
| API-004 recommendMusic | 1 | 1 | 1 | 3 |
| API-005 createSoundscape | 1 | 1 | 1 | 3 |
| API-006 stopSoundscape | 1 | 1 | 1 | 3 |
| API-007 renderVisualizer | 1 | 1 | 1 | 3 |
| API-008 createEmotionCard | 1 | 1 | 1 | 3 |
| API-009 saveCard | 1 | 1 | 1 | 3 |
| API-010 listCards | 1 | 1 | 1 | 3 |
| API-011 getFallbackInput | 1 | 1 | 1 | 3 |
| **合计** | **11** | **11** | **11** | **33** |

---

## 十三、版本历史

| 版本 | 日期 | 变更 | 作者 |
|---|---|---|---|
| v1.0 | 2026-06-27 | 初稿 | AI-TL |
