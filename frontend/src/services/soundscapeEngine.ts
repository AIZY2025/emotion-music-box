import type { MusicProfile, ServiceResult } from "../types";

interface ActiveSound {
  oscillators: OscillatorNode[];
  timers: number[];
  master: GainNode;
  profile: MusicProfile;
  trackIndex: number;
}

let activeSound: ActiveSound | null = null;
let sharedContext: AudioContext | null = null;

function getAudioContext() {
  if (sharedContext && sharedContext.state !== "closed") {
    return sharedContext;
  }
  const AudioCtor = window.AudioContext || window.webkitAudioContext;
  sharedContext = AudioCtor ? new AudioCtor() : null;
  return sharedContext;
}

function frequencyFromBpm(bpm: number, step: number, trackIndex = 0) {
  const root = 174.61;
  const intervalSets = [
    [0, 3, 7, 10, 12, 15],
    [0, 5, 7, 12, 14, 17],
    [0, 2, 7, 9, 12, 16],
    [0, 4, 7, 11, 14, 19],
    [0, 3, 5, 8, 12, 17],
  ];
  const intervals = intervalSets[trackIndex % intervalSets.length];
  return root * Math.pow(2, intervals[step % intervals.length] / 12) * (bpm > 100 ? 1.25 : 1);
}

function playTone(
  context: AudioContext,
  master: GainNode,
  oscillators: OscillatorNode[],
  frequency: number,
  type: OscillatorType,
  startAt: number,
  length: number,
  peak: number,
) {
  const osc = context.createOscillator();
  const gain = context.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, startAt);
  gain.gain.setValueAtTime(0.0001, startAt);
  gain.gain.exponentialRampToValueAtTime(peak, startAt + 0.025);
  gain.gain.exponentialRampToValueAtTime(0.0001, startAt + length);
  osc.connect(gain).connect(master);
  osc.start(startAt);
  osc.stop(startAt + length + 0.03);
  oscillators.push(osc);
}

export async function createSoundscape(profile: MusicProfile): Promise<ServiceResult<{ duration: number; state: string }>> {
  stopSoundscape();
  const context = getAudioContext();
  if (!context) {
    return { ok: false, code: 404, msg: "当前浏览器不支持 Web Audio API" };
  }

  try {
    if (context.state === "suspended") {
      await context.resume();
    }
    const oscillators: OscillatorNode[] = [];
    const timers: number[] = [];
    const master = context.createGain();
    master.connect(context.destination);
    activeSound = { oscillators, timers, master, profile, trackIndex: 0 };

    scheduleTrackLoop(context, activeSound);
    return { ok: true, code: 200, msg: "循环播放中", data: { duration: 0, state: "playing" } };
  } catch {
    stopSoundscape();
    return { ok: false, code: 500, msg: "音乐播放失败" };
  }
}

function scheduleTrackLoop(context: AudioContext, sound: ActiveSound) {
  const { profile, trackIndex, master, oscillators, timers } = sound;
  const now = context.currentTime;
  const duration = 62;
  const interval = 60 / Math.max(48, profile.bpm);
  const trackOffset = trackIndex * 2;

  try {
    const compressor = context.createDynamicsCompressor();
    compressor.threshold.setValueAtTime(-18, now);
    compressor.knee.setValueAtTime(18, now);
    compressor.ratio.setValueAtTime(5, now);
    compressor.attack.setValueAtTime(0.01, now);
    compressor.release.setValueAtTime(0.2, now);
    try {
      master.disconnect();
    } catch {
      // Master may not have existing connections.
    }
    master.connect(compressor).connect(context.destination);
    master.gain.cancelScheduledValues(now);
    master.gain.setValueAtTime(1.8, now);
    master.gain.setValueAtTime(1.8, now + duration - 1.8);
    master.gain.linearRampToValueAtTime(0.3, now + duration - 0.1);

    const toneType: OscillatorType = profile.timbre.includes("贝斯")
      ? "sawtooth"
      : profile.timbre.includes("颗粒")
        ? "triangle"
        : "sine";

    const steps = Math.floor(duration / interval);
    for (let i = 0; i < steps; i++) {
      const timer = window.setTimeout(() => {
        playTone(
          context,
          master,
          oscillators,
          frequencyFromBpm(profile.bpm, i + trackOffset, trackIndex),
          toneType,
          context.currentTime,
          i % 4 === 0 ? 1.4 : 0.75,
          i % 4 === 0 ? 0.95 : 0.68,
        );
      }, i * interval * 1000);
      timers.push(timer);
    }

    const pad = context.createOscillator();
    const padGain = context.createGain();
    pad.type = "sine";
    pad.frequency.value = (profile.bpm > 100 ? 130.81 : 98) * (1 + trackIndex * 0.035);
    padGain.gain.setValueAtTime(0.0001, now);
    padGain.gain.exponentialRampToValueAtTime(0.82, now + 0.35);
    padGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    pad.connect(padGain).connect(master);
    pad.start(now);
    pad.stop(now + duration);
    oscillators.push(pad);

    const loopTimer = window.setTimeout(() => {
      if (!activeSound || activeSound !== sound) return;
      activeSound.trackIndex = (activeSound.trackIndex + 1) % Math.max(1, activeSound.profile.tracks.length || 5);
      scheduleTrackLoop(context, activeSound);
    }, duration * 1000);
    timers.push(loopTimer);
  } catch {
    stopSoundscape();
  }
}

export function stopSoundscape(): ServiceResult<{ state: string }> {
  if (!activeSound) {
    return { ok: true, code: 200, msg: "已停止", data: { state: "stopped" } };
  }
  activeSound.timers.forEach((timer) => window.clearTimeout(timer));
  activeSound.oscillators.forEach((osc) => {
    try {
      osc.stop();
    } catch {
      // Oscillator may already be stopped.
    }
  });
  try {
    activeSound.master.disconnect();
  } catch {
    // Master may already be disconnected.
  }
  activeSound = null;
  return { ok: true, code: 200, msg: "已停止", data: { state: "stopped" } };
}

export async function unlockAudio(): Promise<ServiceResult<{ state: string }>> {
  const context = getAudioContext();
  if (!context) {
    return { ok: false, code: 404, msg: "当前浏览器不支持 Web Audio API" };
  }
  try {
    if (context.state === "suspended") {
      await context.resume();
    }
    const gain = context.createGain();
    const osc = context.createOscillator();
    gain.gain.setValueAtTime(0.0001, context.currentTime);
    osc.frequency.value = 220;
    osc.connect(gain).connect(context.destination);
    osc.start(context.currentTime);
    osc.stop(context.currentTime + 0.02);
    return { ok: true, code: 200, msg: "音频已就绪", data: { state: context.state } };
  } catch {
    return { ok: false, code: 500, msg: "音频初始化失败" };
  }
}
