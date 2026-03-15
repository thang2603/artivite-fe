import type { Tick } from "./type";

export const formatTime = (s: number) => {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  const ms = Math.floor((s % 1) * 10);
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}.${ms}`;
};

export const getTicks = (scale: number, totalSec: number): Tick[] => {
  let minor = 1,
    major = 5;
  if (scale < 20) {
    minor = 10;
    major = 60;
  } else if (scale < 40) {
    minor = 5;
    major = 30;
  } else if (scale < 80) {
    minor = 2;
    major = 10;
  } else if (scale >= 200) {
    minor = 0.25;
    major = 1;
  } else if (scale >= 120) {
    minor = 0.5;
    major = 2;
  }

  const ticks: Tick[] = [];
  for (let t = 0; t <= totalSec + minor; t = +(t + minor).toFixed(6)) {
    const isMajor = Math.abs(t % major) < 0.001;
    ticks.push({
      time: t,
      x: t * scale,
      label: isMajor ? formatTime(t) : "",
      major: isMajor,
    });
  }
  return ticks;
};
