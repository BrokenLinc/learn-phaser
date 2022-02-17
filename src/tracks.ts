import { Segment, SegmentColor } from './types';
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
  const length = 1000;
  const segments = createSection(length);

  // modify segments

  // TODO: map configs to add calls
  const slopeConfig = [
    [0, 0],
    [50, 30],
    [100, 60],
    [200, 0],
  ];
  const turnConfig = [
    [0, 0],
    [100, 5],
    [200, 0],
  ];

  addSlope(segments, {
    start: 0,
    end: 50,
    startElevation: 0,
    endElevation: 30,
  });
  addSlope(segments, {
    start: 50,
    end: 100,
    startElevation: 30,
    endElevation: 60,
  });
  addSlope(segments, {
    start: 100,
    end: 200,
    startElevation: 60,
    endElevation: 0,
  });

  addTurn(segments, {
    start: 0,
    end: 100,
    startTurn: 0,
    endTurn: 5,
  });
  addTurn(segments, {
    start: 100,
    end: 200,
    startTurn: 5,
    endTurn: 0,
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
  };
};
