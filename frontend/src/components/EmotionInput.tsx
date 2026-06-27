import { Sparkles } from "lucide-react";

interface EmotionInputProps {
  value: string;
  intensity: number;
  speechState: string;
  onIntensityChange: (value: number) => void;
  generating: boolean;
}

export function EmotionInput({
  value,
  intensity,
  speechState,
  onIntensityChange,
  generating,
}: EmotionInputProps) {
  return (
    <section className="input-panel" aria-label="情绪输入">
      <div className="panel-heading">
        <p className="eyebrow">Mood Input</p>
        <h2>说出此刻的心情</h2>
      </div>

      <textarea
        value={value}
        maxLength={120}
        readOnly
        placeholder="点击面部识别后，语音识别结果会自动显示在这里。"
        aria-label="语音识别结果"
      />
      <div className="input-meta">
        <span>{speechState || "点击面部识别后会同步启动声音对话"}</span>
        <span>{value.length}/120</span>
      </div>

      <label className="range-row">
        <span>情绪强度</span>
        <input
          min={1}
          max={5}
          step={1}
          type="range"
          value={intensity}
          onChange={(event) => onIntensityChange(Number(event.target.value))}
        />
        <strong>{intensity}/5</strong>
      </label>

      <div className={generating ? "auto-status active" : "auto-status"}>
        <Sparkles size={19} />
        <span>{generating ? "正在自动生成并循环播放" : "面部识别会同步启动声音对话"}</span>
      </div>
    </section>
  );
}
