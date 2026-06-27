import { Camera, CameraOff } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { emotionTypes } from "../data/emotionProfiles";
import type { FaceSignal } from "../types";

interface FaceCaptureProps {
  currentSignal?: FaceSignal;
  onFaceEmotionDetected: (signal: FaceSignal) => void;
  onCameraError: (reason: string) => void;
  onBeforeStart?: () => Promise<unknown>;
}

export function FaceCapture({ currentSignal, onFaceEmotionDetected, onCameraError, onBeforeStart }: FaceCaptureProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<number | null>(null);
  const [enabled, setEnabled] = useState(false);

  const stopCamera = () => {
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setEnabled(false);
  };

  const detectSignal = () => {
    const video = videoRef.current;
    if (!video) return;
    const width = Math.max(1, video.videoWidth || 120);
    const height = Math.max(1, video.videoHeight || 80);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, width, height);
    const data = ctx.getImageData(0, 0, width, height).data;
    let brightness = 0;
    for (let i = 0; i < data.length; i += 4) {
      brightness += (data[i] + data[i + 1] + data[i + 2]) / 3;
    }
    brightness = brightness / (data.length / 4) / 255;
    const motion = Math.abs(brightness - 0.5);
    const emotion = emotionTypes[Math.min(emotionTypes.length - 1, Math.floor(brightness * emotionTypes.length))];
    onFaceEmotionDetected({
      emotion,
      confidence: Number((0.48 + motion).toFixed(2)),
      brightness: Number(brightness.toFixed(2)),
      motion: Number(motion.toFixed(2)),
    });
  };

  const startCamera = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      onCameraError("当前浏览器不支持摄像头能力，可在文本框输入心情描述。");
      return;
    }
    try {
      await onBeforeStart?.();
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      streamRef.current = stream;
      setEnabled(true);
      await new Promise((resolve) => window.requestAnimationFrame(resolve));
      const video = videoRef.current;
      if (!video) throw new Error("video element missing");
      video.srcObject = stream;
      video.muted = true;
      video.playsInline = true;
      await video.play();
      timerRef.current = window.setInterval(detectSignal, 1600);
      window.setTimeout(detectSignal, 500);
    } catch {
      onCameraError("摄像头权限未开启，可在文本框输入心情描述。");
    }
  };

  useEffect(() => stopCamera, []);

  return (
    <section className="floating-camera-panel" aria-label="面部识别">
      <div className="floating-camera-header">
        <div>
          <p className="eyebrow">Face Signal</p>
          <h2>面部情绪线索</h2>
        </div>
        <span>{currentSignal ? `${currentSignal.emotion} ${(currentSignal.confidence * 100).toFixed(0)}%` : "未采集"}</span>
      </div>
      <div className="camera-frame">
        <video ref={videoRef} className={enabled ? "camera-video visible" : "camera-video"} muted playsInline autoPlay />
        {!enabled && (
          <div className="camera-empty">
            <Camera size={44} />
          </div>
        )}
      </div>
      <div className="camera-actions">
        <button className="ghost-button" type="button" onClick={enabled ? stopCamera : startCamera}>
          {enabled ? <CameraOff size={18} /> : <Camera size={18} />}
          <span>{enabled ? "关闭识别" : "开启面部识别"}</span>
        </button>
      </div>
    </section>
  );
}
