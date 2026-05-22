export const easings = {
  easeInOut: [0.4, 0, 0.2, 1],
  easeOut: [0, 0, 0.2, 1],
} as const;

export const durations = {
  normal: 300,
} as const;

export function interpolate(_a: number, _b: number, _t: number) { return _a; }

