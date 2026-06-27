export type EmotionType = "平静" | "开心" | "焦虑" | "低落" | "愤怒" | "期待";

export type SourceType = "文本" | "语音" | "面部" | "手动";

export interface FaceSignal {
  emotion: EmotionType;
  confidence: number;
  brightness: number;
  motion: number;
}

export interface EmotionInput {
  text: string;
  manualEmotion?: EmotionType;
  intensity: number;
  faceSignal?: FaceSignal;
  speechUsed: boolean;
}

export interface EmotionResult {
  emotion: EmotionType;
  intensity: number;
  confidence: number;
  sources: SourceType[];
  summary: string;
}

export interface VirtualTrack {
  title: string;
  artist: string;
  duration: string;
}

export interface MusicProfile {
  bpm: number;
  mode: string;
  timbre: string;
  rhythmDensity: string;
  tags: string[];
  tracks: VirtualTrack[];
  response: string;
}

export interface VisualTheme {
  primary: string;
  secondary: string;
  accent: string;
  surface: string;
}

export interface EmotionCardData {
  id: string;
  createdAt: string;
  input: EmotionInput;
  result: EmotionResult;
  music: MusicProfile;
  visualTheme: VisualTheme;
}

export interface ServiceResult<T = unknown> {
  ok: boolean;
  code: number;
  msg: string;
  data?: T;
}

export interface EmotionProfile {
  bpmRange: [number, number];
  mode: string;
  timbre: string;
  rhythmDensity: string;
  tags: string[];
  tracks: VirtualTrack[];
  theme: VisualTheme;
  responses: string[];
  keywords: string[];
}
