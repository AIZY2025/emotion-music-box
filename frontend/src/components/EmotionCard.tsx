import { Activity, Gauge, Music2, Palette } from "lucide-react";
import type { EmotionCardData } from "../types";

interface EmotionCardProps {
  card: EmotionCardData;
}

export function EmotionCard({ card }: EmotionCardProps) {
  return (
    <section className="result-card" style={{ borderColor: card.visualTheme.primary }}>
      <div className="result-header">
        <div>
          <p className="eyebrow">Emotion Card</p>
          <h2>{card.result.emotion}</h2>
        </div>
        <span className="confidence">{Math.round(card.result.confidence * 100)}%</span>
      </div>
      <p className="summary">{card.result.summary}</p>
      <p className="response">{card.music.response}</p>

      <div className="metric-grid">
        <div><Gauge size={18} /><span>BPM {card.music.bpm}</span></div>
        <div><Music2 size={18} /><span>{card.music.timbre}</span></div>
        <div><Activity size={18} /><span>{card.music.rhythmDensity}</span></div>
        <div><Palette size={18} /><span>{card.music.mode}</span></div>
      </div>

      <div className="tag-row">
        {card.music.tags.map((tag) => <span key={tag}>{tag}</span>)}
      </div>
    </section>
  );
}
