import { useEffect, useMemo, useRef, useState } from "react";
import { AudioControls } from "./components/AudioControls";
import { EmotionCard } from "./components/EmotionCard";
import { EmotionInput } from "./components/EmotionInput";
import { FaceCapture } from "./components/FaceCapture";
import { HistoryPanel } from "./components/HistoryPanel";
import { PetAli } from "./components/PetAli";
import { Visualizer } from "./components/Visualizer";
import { getEmotionProfile } from "./data/emotionProfiles";
import { analyzeEmotion } from "./services/emotionAnalyzer";
import { recommendMusic } from "./services/musicRecommender";
import { createSoundscape, stopSoundscape, unlockAudio } from "./services/soundscapeEngine";
import { clearCards, listCards, saveCard } from "./services/storageService";
import type { EmotionCardData, FaceSignal } from "./types";

function createCardId() {
  return `card_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`;
}

function startSpeechRecognition(
  onResult: (text: string) => void,
  onState: (state: string) => void,
  onUnavailable?: () => void,
) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    onState("不支持语音，已切换文本");
    onUnavailable?.();
    return;
  }
  const recognition = new SpeechRecognition();
  recognition.lang = "zh-CN";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  recognition.onstart = () => onState("正在聆听");
  recognition.onerror = () => onState("语音失败，可输入文字");
  recognition.onend = () => onState("");
  recognition.onresult = (event) => {
    const text = event.results?.[0]?.[0]?.transcript ?? "";
    onResult(text.slice(0, 120));
  };
  recognition.start();
}

export default function App() {
  const [text, setText] = useState("");
  const [intensity, setIntensity] = useState(3);
  const [faceSignal, setFaceSignal] = useState<FaceSignal | undefined>();
  const [speechUsed, setSpeechUsed] = useState(false);
  const [speechState, setSpeechState] = useState("");
  const [message, setMessage] = useState("");
  const [generating, setGenerating] = useState(false);
  const [currentCard, setCurrentCard] = useState<EmotionCardData | null>(null);
  const [history, setHistory] = useState<EmotionCardData[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const lastAutoSignatureRef = useRef("");

  useEffect(() => {
    setHistory(listCards());
    return () => {
      stopSoundscape();
    };
  }, []);

  const activeTheme = useMemo(
    () => currentCard?.visualTheme ?? getEmotionProfile("平静").theme,
    [currentCard],
  );

  const handleGenerate = (autoPlay = false) => {
    setGenerating(true);
    setMessage("");
    stopSoundscape();
    setIsPlaying(false);
    window.setTimeout(async () => {
      const input = {
        text: text.trim().slice(0, 120),
        intensity,
        faceSignal,
        speechUsed,
      };
      const result = analyzeEmotion(input);
      const music = recommendMusic(result);
      const visualTheme = getEmotionProfile(result.emotion).theme;
      const card: EmotionCardData = {
        id: createCardId(),
        createdAt: new Date().toISOString(),
        input,
        result,
        music,
        visualTheme,
      };
      const saved = saveCard(card);
      setCurrentCard(card);
      setHistory(listCards());
      setGenerating(false);
      if (autoPlay) {
        const playResult = await createSoundscape(card.music);
        setIsPlaying(playResult.ok);
        setMessage(playResult.ok ? "已自动生成情绪音乐卡并循环播放" : `${saved.ok ? "情绪音乐卡已生成，" : saved.msg} ${playResult.msg}`);
      } else {
        setMessage(saved.ok ? "情绪音乐卡已生成" : saved.msg);
      }
    }, 360);
  };

  const handlePlay = async (card = currentCard) => {
    if (!card) return;
    const result = await createSoundscape(card.music);
    setIsPlaying(result.ok);
    setMessage(result.msg);
  };

  const handleStop = () => {
    const result = stopSoundscape();
    setIsPlaying(false);
    setMessage(result.msg);
  };

  const handleRegenerate = () => {
    if (!currentCard) return;
    const music = recommendMusic({ ...currentCard.result, intensity: Math.min(5, currentCard.result.intensity + 1) });
    const nextCard = { ...currentCard, id: createCardId(), createdAt: new Date().toISOString(), music };
    stopSoundscape();
    setIsPlaying(false);
    setCurrentCard(nextCard);
    saveCard(nextCard);
    setHistory(listCards());
    setMessage("已重新生成音乐参数");
  };

  const handleClearHistory = () => {
    if (!window.confirm("确认清空本地历史记录？")) return;
    clearCards();
    setHistory([]);
  };

  useEffect(() => {
    const normalizedText = text.trim();
    const facePart = faceSignal ? `${faceSignal.emotion}:${Math.round(faceSignal.confidence * 10)}` : "";
    if (!normalizedText && !faceSignal) return;
    if (normalizedText && !speechUsed && !faceSignal) return;

    const signature = `${normalizedText}|${facePart}|${intensity}`;
    if (signature === lastAutoSignatureRef.current) return;
    lastAutoSignatureRef.current = signature;

    const timer = window.setTimeout(() => {
      handleGenerate(true);
    }, faceSignal ? 450 : 650);

    return () => window.clearTimeout(timer);
  }, [text, faceSignal, intensity]);

  return (
    <main className="app-shell">
      <PetAli emotion={currentCard?.result.emotion ?? "平静"} isPlaying={isPlaying} />
      <section className="hero-band">
        <div>
          <p className="eyebrow">Emotion Music Box</p>
          <h1>情绪音乐盒</h1>
          <p>点击面部识别后同步启动声音对话，自动生成专属音乐参数、循环音乐和可截图的情绪音乐卡。</p>
        </div>
        <Visualizer
          emotion={currentCard?.result.emotion ?? "平静"}
          intensity={currentCard?.result.intensity ?? intensity}
          isPlaying={isPlaying}
          theme={activeTheme}
        />
      </section>

      <section className="main-grid">
        <div className="left-column">
          <EmotionInput
            value={text}
            intensity={intensity}
            speechState={speechState}
            generating={generating}
            onIntensityChange={setIntensity}
          />
          <FaceCapture
            currentSignal={faceSignal}
            onFaceEmotionDetected={setFaceSignal}
            onCameraError={(reason) => setMessage(reason)}
            onBeforeStart={async () => {
              await unlockAudio();
              startSpeechRecognition(
                (nextText) => {
                  setText(nextText);
                  setSpeechUsed(true);
                },
                setSpeechState,
                () => setSpeechUsed(false),
              );
            }}
          />
          <div className="inline-status" aria-live="polite">
            {message || "等待面部识别与声音对话输入"}
          </div>
        </div>

        <div className="right-column">
          <div className="result-stack">
            {currentCard ? (
              <>
              <EmotionCard card={currentCard} />
              <AudioControls
                disabled={!currentCard}
                isPlaying={isPlaying}
                onPlay={handlePlay}
                onPause={handleStop}
                onRegenerate={handleRegenerate}
              />
              </>
            ) : (
              <section className="result-placeholder">
                <p className="eyebrow">Result</p>
                <h2>等待生成</h2>
                <p>点击左侧面部识别，系统会同步采集面部线索和声音描述，并自动生成音乐卡。</p>
              </section>
            )}
          </div>
        </div>
      </section>

      <section className="history-row">
        <HistoryPanel cards={history} onSelectHistory={setCurrentCard} onClearHistory={handleClearHistory} />
      </section>
    </main>
  );
}
