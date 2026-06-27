import { useMemo, useState } from "react";
import type { EmotionType } from "../types";

interface PetAliProps {
  emotion: EmotionType;
  isPlaying: boolean;
}

const petMessages: Record<EmotionType, string[]> = {
  平静: ["我陪你慢慢呼吸。", "现在的节奏刚刚好。"],
  开心: ["这份开心要好好收藏！", "尾巴已经跟着节拍摇起来啦。"],
  焦虑: ["先看着我，慢慢吸气。", "不用一次解决所有事。"],
  低落: ["我会在这里陪你一会儿。", "今天慢一点也没关系。"],
  愤怒: ["先把力量放进音乐里。", "我们一起把边界画清楚。"],
  期待: ["我也在等那个好消息。", "新的入口快出现了。"],
};

export function PetAli({ emotion, isPlaying }: PetAliProps) {
  const [messageIndex, setMessageIndex] = useState(0);
  const message = useMemo(() => {
    const options = petMessages[emotion] ?? petMessages.平静;
    return options[messageIndex % options.length];
  }, [emotion, messageIndex]);

  return (
    <button
      className={`pet-ali pet-${emotion} ${isPlaying ? "pet-playing" : ""}`}
      type="button"
      onClick={() => setMessageIndex((value) => value + 1)}
      aria-label={`阿狸宠物，当前情绪${emotion}`}
    >
      <span className="pet-bubble">{message}</span>
      <span className="pet-body">
        <span className="pet-tail" />
        <span className="pet-ear pet-ear-left" />
        <span className="pet-ear pet-ear-right" />
        <span className="pet-face">
          <span className="pet-eye pet-eye-left" />
          <span className="pet-eye pet-eye-right" />
          <span className="pet-cheek pet-cheek-left" />
          <span className="pet-cheek pet-cheek-right" />
          <span className="pet-nose" />
          <span className="pet-mouth" />
        </span>
        <span className="pet-note">♪</span>
      </span>
    </button>
  );
}
