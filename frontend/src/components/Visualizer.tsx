import { useEffect, useRef } from "react";
import type { EmotionType, VisualTheme } from "../types";

interface VisualizerProps {
  emotion?: EmotionType;
  intensity: number;
  isPlaying: boolean;
  theme: VisualTheme;
}

export function Visualizer({ emotion = "平静", intensity, isPlaying, theme }: VisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    let frame = 0;
    let raf = 0;
    const draw = () => {
      const rect = canvas.getBoundingClientRect();
      const scale = window.devicePixelRatio || 1;
      canvas.width = Math.max(1, Math.floor(rect.width * scale));
      canvas.height = Math.max(1, Math.floor(rect.height * scale));
      ctx.setTransform(scale, 0, 0, scale, 0, 0);
      ctx.clearRect(0, 0, rect.width, rect.height);
      ctx.fillStyle = theme.surface;
      ctx.fillRect(0, 0, rect.width, rect.height);

      const bars = 34;
      const gap = 5;
      const barWidth = (rect.width - gap * (bars - 1)) / bars;
      for (let i = 0; i < bars; i++) {
        const wave = Math.sin(frame / 18 + i * 0.45);
        const amp = isPlaying ? 28 + intensity * 16 : 18 + intensity * 8;
        const height = Math.max(18, amp * (0.55 + Math.abs(wave)));
        ctx.fillStyle = i % 3 === 0 ? theme.accent : theme.primary;
        ctx.beginPath();
        ctx.roundRect(i * (barWidth + gap), rect.height - height - 22, barWidth, height, 5);
        ctx.fill();
      }

      ctx.fillStyle = theme.secondary;
      ctx.globalAlpha = 0.25;
      for (let i = 0; i < 18 + intensity * 4; i++) {
        const x = (i * 53 + frame * (isPlaying ? 1.5 : 0.2)) % rect.width;
        const y = 38 + ((i * 31 + frame) % Math.max(80, rect.height - 110));
        ctx.beginPath();
        ctx.arc(x, y, 3 + (i % 4), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.fillStyle = theme.primary;
      ctx.font = "700 18px Microsoft YaHei, sans-serif";
      ctx.fillText(emotion, 22, 34);
      frame += 1;
      raf = window.requestAnimationFrame(draw);
    };
    draw();
    return () => window.cancelAnimationFrame(raf);
  }, [emotion, intensity, isPlaying, theme]);

  return <canvas className="visualizer" ref={canvasRef} aria-label="情绪音乐可视化" />;
}
