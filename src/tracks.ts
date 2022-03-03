import _ from 'lodash';

import { Segment, SegmentColor } from './types';
import { COLOR, SEGMENT_LENGTH } from './constants';

const SEGMENT_COLOR: Record<string, SegmentColor> = {
  LIGHT: {
    road: COLOR.charcoal,
    underRoad: COLOR.charcoal,
    grass: COLOR.black,
    rumble: COLOR.teal,
  },
  DARK: {
    road: COLOR.charcoal,
    underRoad: COLOR.charcoal,
    grass: COLOR.black,
    rumble: COLOR.teal,
    lane: COLOR.gray,
  },
};

type SlopeConfig = [number, number][];
type TurnConfig = [number, number][];

export const createRoad = () => {
  const slopeConfig: SlopeConfig = [
    [0, 0],
    [100, 120],
    [200, 0],
    [300, -100],
    [400, 20],
    [500, 100],
    [600, -30],
    [700, 90],
    [800, -10],
    [900, 40],
    [1000, 0],
  ];
  const turnConfig: TurnConfig = [
    [0, 0],
    [100, 5],
    [200, 0],
    [300, -5],
    [400, 0],
    [500, 2],
    [600, 0],
    [700, -8],
    [800, 0],
    [900, 3],
    [1000, 0],
  ];
  return createRoadWithConfigs(1000, slopeConfig, turnConfig);
};

export const createRoadWithConfigs = (
  length: number,
  slopeConfig: SlopeConfig,
  turnConfig: TurnConfig
) => {
  const segments = createSection(length);

  // modify segments
  slopeConfig.forEach(([end, endElevation], i) => {
    if (i === 0) return;

    const [start, startElevation] = slopeConfig[i - 1];
    addSlope(segments, {
      start,
      end,
      startElevation,
      endElevation,
    });
  });
  turnConfig.forEach(([end, endTurn], i) => {
    if (i === 0) return;

    const [start, startTurn] = turnConfig[i - 1];
    addTurn(segments, {
      start,
      end,
      startTurn,
      endTurn,
    });
  });

  return segments;
};

interface SlopeOptions {
  start: number;
  end: number;
  startElevation: number;
  endElevation: number;
}

export const addSlope = (
  segments: Segment[],
  { start, end, startElevation, endElevation }: SlopeOptions
) => {
  const length = end - start;
  for (let i = start; i < end; i += 1) {
    const frac = (i - start) / length;
    const offset = 1;
    const amp = (Math.cos((frac + offset) * Math.PI) + 1) / 2; // eases from 0 to 1
    segments[i].point.world.y =
      (startElevation + amp * (endElevation - startElevation)) * 100;
  }
};

interface TurnOptions {
  start: number;
  end: number;
  startTurn: number;
  endTurn: number;
}

export const addTurn = (
  segments: Segment[],
  { start, end, startTurn, endTurn }: TurnOptions
) => {
  const length = end - start;
  for (let i = start; i < end; i += 1) {
    const frac = (i - start) / length;
    const offset = 1;
    const amp = (Math.cos((frac + offset) * Math.PI) + 1) / 2; // eases from 0 to 1
    segments[i].point.turn = startTurn + amp * (endTurn - startTurn);
  }
};

export const createSection = (nSegments: number) => {
  const segments: Segment[] = [];
  for (let i = 0; i < nSegments; i += 1) {
    segments.push(createSegment(i));
  }
  return segments;
};

export const createSegment = (n: number): Segment => {
  return {
    index: n,
    point: {
      world: {
        x: 0,
        y: 0,
        z: n * SEGMENT_LENGTH,
      },
      screen: { x: 0, y: 0, w: 0, h: 0 },
      scale: -1,
      turn: 0,
    },
    color:
      Math.floor(n / 5) % 2
        ? { ...SEGMENT_COLOR.DARK }
        : { ...SEGMENT_COLOR.LIGHT },
    hash: _.random(0, 1, true),
    hash2: _.random(0, 1, true),
  };
};
