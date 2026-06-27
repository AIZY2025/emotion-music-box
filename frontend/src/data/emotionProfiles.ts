import type { EmotionProfile, EmotionType } from "../types";

export const emotionTypes: EmotionType[] = ["平静", "开心", "焦虑", "低落", "愤怒", "期待"];

export const emotionProfiles: Record<EmotionType, EmotionProfile> = {
  平静: {
    bpmRange: [64, 82],
    mode: "自然大调 / 开放和声",
    timbre: "柔和电钢琴",
    rhythmDensity: "低密度",
    tags: ["呼吸感", "水面", "轻柔", "放松"],
    tracks: [
      { title: "月光慢慢落下", artist: "Quiet Signal", duration: "01:12" },
      { title: "浅蓝色房间", artist: "Soft Echo", duration: "01:06" },
      { title: "十分钟之后", artist: "Still Keys", duration: "01:18" },
      { title: "湖面没有风", artist: "Calm Layer", duration: "01:09" },
      { title: "慢呼吸练习", artist: "Breath Pad", duration: "01:14" },
    ],
    theme: { primary: "#2f6b63", secondary: "#92c9b8", accent: "#f1c65b", surface: "#eef7f0" },
    responses: ["你现在需要的是一点空间，音乐会把节奏放慢。", "先让呼吸稳定下来，再继续往前走。"],
    keywords: ["平静", "放松", "还好", "安静", "舒服", "稳定"],
  },
  开心: {
    bpmRange: [112, 138],
    mode: "明亮大调",
    timbre: "清脆合成器",
    rhythmDensity: "高密度",
    tags: ["明亮", "跳跃", "轻快", "阳光"],
    tracks: [
      { title: "把窗户打开", artist: "Sunny Loop", duration: "00:58" },
      { title: "闪闪发亮的路", artist: "Pop Dust", duration: "01:04" },
      { title: "今天值得庆祝", artist: "Bright Room", duration: "01:10" },
      { title: "汽水泡泡", artist: "Sweet Bounce", duration: "01:02" },
      { title: "轻快转弯", artist: "Happy Steps", duration: "01:07" },
    ],
    theme: { primary: "#d46b2c", secondary: "#f4a261", accent: "#2a9d8f", surface: "#fff5df" },
    responses: ["这份轻快值得被放大一点，节奏会跟着亮起来。", "让旋律把这股能量保留下来。"],
    keywords: ["开心", "高兴", "快乐", "兴奋", "满足", "开心死了"],
  },
  焦虑: {
    bpmRange: [88, 118],
    mode: "悬浮小调",
    timbre: "颗粒合成器",
    rhythmDensity: "中高密度",
    tags: ["紧张", "悬浮", "微颤", "释放"],
    tracks: [
      { title: "心跳降噪", artist: "Pulse Filter", duration: "01:15" },
      { title: "把事情排成一列", artist: "Nervous Pad", duration: "01:02" },
      { title: "云层之后", artist: "Soft Alarm", duration: "01:09" },
      { title: "慢慢拆开结", artist: "Tension Map", duration: "01:12" },
      { title: "安静的提醒", artist: "Signal Ease", duration: "01:05" },
    ],
    theme: { primary: "#6c4ab6", secondary: "#d66ba0", accent: "#f2c94c", surface: "#f4efff" },
    responses: ["先把注意力收回来，音乐会帮你把紧绷感拆小。", "不用马上解决全部，先处理此刻这一分钟。"],
    keywords: ["焦虑", "紧张", "担心", "压力", "害怕", "慌", "烦"],
  },
  低落: {
    bpmRange: [58, 76],
    mode: "温和小调",
    timbre: "低频钢琴",
    rhythmDensity: "低密度",
    tags: ["低频", "陪伴", "缓慢", "阴天"],
    tracks: [
      { title: "阴天也会过去", artist: "Grey Piano", duration: "01:20" },
      { title: "留一点光", artist: "Low Room", duration: "01:13" },
      { title: "慢慢回到这里", artist: "Warm Minor", duration: "01:16" },
      { title: "旧毛衣的温度", artist: "Soft Minor", duration: "01:18" },
      { title: "把灯调暗", artist: "Blue Keys", duration: "01:11" },
    ],
    theme: { primary: "#3b5266", secondary: "#7a90a4", accent: "#e0b75a", surface: "#edf1f5" },
    responses: ["低落不用被立刻赶走，先让音乐陪它坐一会儿。", "今天慢一点也可以，旋律会留一盏小灯。"],
    keywords: ["低落", "难过", "累", "疲惫", "失落", "沮丧", "没劲"],
  },
  愤怒: {
    bpmRange: [96, 128],
    mode: "强拍小调",
    timbre: "粗颗粒贝斯",
    rhythmDensity: "强密度",
    tags: ["强拍", "释放", "边界", "热量"],
    tracks: [
      { title: "红色出口", artist: "Hard Pulse", duration: "01:00" },
      { title: "别再压住", artist: "Raw Edge", duration: "01:06" },
      { title: "把线画清楚", artist: "Deep Hit", duration: "01:08" },
      { title: "热量释放", artist: "Impact Line", duration: "01:03" },
      { title: "重拍之后", artist: "Bass Gate", duration: "01:09" },
    ],
    theme: { primary: "#9b2c2c", secondary: "#e76f51", accent: "#264653", surface: "#fff0ec" },
    responses: ["这股力量需要出口，但不需要伤到你自己。", "音乐会保留强度，也帮你把边界画清楚。"],
    keywords: ["愤怒", "生气", "火大", "烦躁", "气死", "不爽"],
  },
  期待: {
    bpmRange: [100, 124],
    mode: "上行大调",
    timbre: "玻璃钟琴",
    rhythmDensity: "中密度",
    tags: ["上升", "未来", "清透", "准备"],
    tracks: [
      { title: "下一站发光", artist: "Forward Bell", duration: "01:05" },
      { title: "快要开始了", artist: "Lift Tone", duration: "01:02" },
      { title: "新的入口", artist: "Clear Steps", duration: "01:11" },
      { title: "倒数三秒", artist: "Future Tick", duration: "01:06" },
      { title: "风从前面来", artist: "Open Path", duration: "01:12" },
    ],
    theme: { primary: "#287c8e", secondary: "#6bc4b8", accent: "#f29f05", surface: "#ecfbf9" },
    responses: ["期待里有一点紧张，也有正在靠近的新可能。", "让节奏往上走，给即将发生的事留位置。"],
    keywords: ["期待", "希望", "准备", "未来", "开始", "想要", "盼"],
  },
};

export function getEmotionProfile(emotion?: EmotionType): EmotionProfile {
  return emotion ? emotionProfiles[emotion] ?? emotionProfiles.平静 : emotionProfiles.平静;
}
