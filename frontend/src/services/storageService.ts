import type { EmotionCardData, ServiceResult } from "../types";

const STORAGE_KEY = "emotion_music_cards";
const MAX_CARDS = 12;

function parseCards(): EmotionCardData[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((item) => item?.id && item?.result && item?.music) : [];
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return [];
  }
}

export function saveCard(card: EmotionCardData): ServiceResult<{ count: number }> {
  try {
    if (!card.id || !card.createdAt || !card.result || !card.music) {
      return { ok: false, code: 400, msg: "情绪卡数据不完整" };
    }
    const existing = parseCards().filter((item) => item.id !== card.id);
    const latest = existing[0];
    const cards =
      latest?.result.emotion === card.result.emotion
        ? [{ ...card, id: latest.id, createdAt: latest.createdAt }, ...existing.slice(1)].slice(0, MAX_CARDS)
        : [card, ...existing].slice(0, MAX_CARDS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
    return {
      ok: true,
      code: 200,
      msg: latest?.result.emotion === card.result.emotion ? "情绪未变化，已更新当前记录" : "保存成功",
      data: { count: cards.length },
    };
  } catch {
    return { ok: false, code: 500, msg: "历史记录保存失败" };
  }
}

export function listCards(): EmotionCardData[] {
  return parseCards().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function clearCards(): ServiceResult {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return { ok: true, code: 200, msg: "已清空历史记录" };
  } catch {
    return { ok: false, code: 500, msg: "清空失败" };
  }
}
