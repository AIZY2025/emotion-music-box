import { getEmotionProfile } from "../data/emotionProfiles";
import type { EmotionResult, MusicProfile } from "../types";

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function recommendMusic(result: EmotionResult): MusicProfile {
  const profile = getEmotionProfile(result.emotion);
  const intensity = clamp(result.intensity, 1, 5);
  const [minBpm, maxBpm] = profile.bpmRange;
  const bpm = Math.round(minBpm + ((maxBpm - minBpm) * (intensity - 1)) / 4);
  const tagCount = intensity >= 4 ? 5 : 3;

  return {
    bpm,
    mode: profile.mode,
    timbre: profile.timbre,
    rhythmDensity: profile.rhythmDensity,
    tags: profile.tags.slice(0, tagCount),
    tracks: profile.tracks.slice(0, 5),
    response: profile.responses[(intensity + result.emotion.length) % profile.responses.length],
  };
}
