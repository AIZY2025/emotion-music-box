import { Pause, Play, RefreshCw } from "lucide-react";

interface AudioControlsProps {
  isPlaying: boolean;
  disabled: boolean;
  onPlay: () => void;
  onPause: () => void;
  onRegenerate: () => void;
}

export function AudioControls({ isPlaying, disabled, onPlay, onPause, onRegenerate }: AudioControlsProps) {
  return (
    <div className="audio-controls">
      <button className="primary-button" type="button" disabled={disabled} onClick={isPlaying ? onPause : onPlay}>
        {isPlaying ? <Pause size={19} /> : <Play size={19} />}
        <span>{isPlaying ? "暂停音乐" : "播放音乐"}</span>
      </button>
      <button className="icon-button" type="button" disabled={disabled} onClick={onRegenerate} aria-label="重新生成">
        <RefreshCw size={18} />
      </button>
    </div>
  );
}
