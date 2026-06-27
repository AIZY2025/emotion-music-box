import { emotionProfiles, emotionTypes } from "../data/emotionProfiles";
import type { EmotionInput, EmotionResult, EmotionType, SourceType } from "../types";

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function analyzeEmotion(input: EmotionInput): EmotionResult {
  const scores = new Map<EmotionType, number>(emotionTypes.map((emotion) => [emotion, 0]));
  const sources = new Set<SourceType>();
  const text = input.text.trim().slice(0, 120);

  if (input.manualEmotion) {
    scores.set(input.manualEmotion, (scores.get(input.manualEmotion) ?? 0) + 4);
    sources.add("手动");
  }

  if (text) {
    for (const emotion of emotionTypes) {
      const profile = emotionProfiles[emotion];
      for (const keyword of profile.keywords) {
        if (text.includes(keyword)) {
          scores.set(emotion, (scores.get(emotion) ?? 0) + 2);
          sources.add(input.speechUsed ? "语音" : "文本");
        }
      }
    }
  }

  if (input.faceSignal && input.faceSignal.confidence >= 0.4) {
    const boost = clamp(input.faceSignal.confidence, 0, 1) * 3;
    scores.set(input.faceSignal.emotion, (scores.get(input.faceSignal.emotion) ?? 0) + boost);
    sources.add("面部");
  }

  const priority: EmotionType[] = input.manualEmotion
    ? [input.manualEmotion, ...emotionTypes.filter((emotion) => emotion !== input.manualEmotion)]
    : emotionTypes;

  let emotion: EmotionType = "平静";
  let topScore = -1;
  for (const item of priority) {
    const score = scores.get(item) ?? 0;
    if (score > topScore) {
      emotion = item;
      topScore = score;
    }
  }

  if (topScore <= 0) {
    emotion = "平静";
    topScore = 1;
  }

  const intensity = clamp(Math.round(input.intensity || topScore), 1, 5);
  const confidence = clamp(0.42 + sources.size * 0.14 + topScore / 18, 0.42, 0.96);
  const fallbackSource: SourceType = text ? (input.speechUsed ? "语音" : "文本") : input.faceSignal ? "面部" : "文本";
  const sourceList: SourceType[] = sources.size ? Array.from(sources) : [fallbackSource];
  const summary = `综合${sourceList.join("、")}线索，当前更接近“${emotion}”，强度 ${intensity}/5。`;

  return {
    emotion,
    intensity,
    confidence: Number(confidence.toFixed(2)),
    sources: sourceList,
    summary,
  };
}
