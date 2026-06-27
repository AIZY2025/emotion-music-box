import type { EmotionCardData } from "../types";

interface HistoryPanelProps {
  cards: EmotionCardData[];
  onSelectHistory: (card: EmotionCardData) => void;
  onClearHistory: () => void;
}

export function HistoryPanel({ cards, onSelectHistory, onClearHistory }: HistoryPanelProps) {
  const formatDate = (value: string) =>
    new Date(value).toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <section className="history-panel">
      <div className="history-heading">
        <div>
          <p className="eyebrow">History</p>
          <h2>最近的情绪卡（{cards.length}/12）</h2>
        </div>
        <button className="text-button" type="button" onClick={onClearHistory} disabled={cards.length === 0}>
          清空
        </button>
      </div>
      {cards.length === 0 ? (
        <p className="empty-text">生成后会在这里保留最近 12 张情绪音乐卡。</p>
      ) : (
        <div className="history-list">
          {cards.map((card) => (
            <button key={card.id} type="button" onClick={() => onSelectHistory(card)}>
              <span style={{ background: card.visualTheme.primary }} />
              <div>
                <strong>{card.result.emotion}</strong>
                <em>{formatDate(card.createdAt)}</em>
              </div>
              <small>
                BPM {card.music.bpm} · 强度 {card.result.intensity}/5 · 置信度 {Math.round(card.result.confidence * 100)}%
              </small>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
