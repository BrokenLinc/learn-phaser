import { SegmentColor } from './types';
import { COLOR, SEGMENT_LENGTH } from './constants';

const SEGMENT_COLOR: Record<string, SegmentColor> = {
  LIGHT: {
    road: COLOR.gray,
    grass: COLOR.green,
    rumble: COLOR.red,
  },
  DARK: {
    road: COLOR.darkgray,
    grass: COLOR.darkgreen,
    rumble: COLOR.almostwhite,
    lane: COLOR.almostwhite,
  },
};

export const createRoad = () => {
  return createSection(300);
};

export const createSection = (nSegments: number) => {
  const segments = [];
  for (let i = 0; i < nSegments; i += 1) {
    segments.push(createSegment(i, nSegments));
  }
  return segments;
};

export const createSegment = (n: number, sectionLength: number) => {
  return {
    index: n,
    point: {
      world: {
        x: 0,
        y: Math.sin((n / sectionLength) * 2 * Math.PI * 2) * 3000,
        z: n * SEGMENT_LENGTH,
      },
      screen: { x: 0, y: 0, w: 0, h: 0 },
      scale: -1,
      turn: Math.sin((n / sectionLength) * Math.PI * 2) * 5,
    },
    color:
      Math.floor(n / 5) % 2
        ? { ...SEGMENT_COLOR.DARK }
        : { ...SEGMENT_COLOR.LIGHT },
  };
};
