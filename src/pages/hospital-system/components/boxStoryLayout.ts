/**
 * Geometry for the Box story (BoxStory.tsx), in SVG units. Two layouts:
 * "wide" (one row of six devices over the record, the box below) and
 * "tall" for phones (three devices above the record, three below, the box
 * at the foot). Ids and labels are generic on purpose: the bundle is public.
 */

export type FragmentKind = "strip" | "photo" | "numbers" | "note";

export type Device = {
  id: string;
  label: string;
  /** Frame centre. */
  cx: number;
  cy: number;
  /** Where its key seats: the frame edge facing the record. */
  socket: { x: number; y: number };
  /** Keys enter from below (false) or from above (true, the lower row on phones). */
  flip: boolean;
  /** Its own beat while nothing is connected (seconds). */
  beat: number;
};

export type Fragment = { id: string; kind: FragmentKind; x: number; y: number; rotate: number };

export type Layout = {
  width: number;
  height: number;
  frame: { w: number; h: number };
  devices: Device[];
  fragments: Fragment[];
  card: { x: number; y: number; w: number; h: number };
  box: { x: number; y: number; w: number; h: number };
  /** Where each key waits inside the box. */
  keySlots: Array<{ x: number; y: number }>;
  /** One thin line per device, from its key to the record. */
  staves: string[];
};

const DEVICES = [
  { id: "lamp", label: "Lamp", beat: 0.9 },
  { id: "desk", label: "Test machine", beat: 1.37 },
  { id: "scanner", label: "Scanner", beat: 0.71 },
  { id: "printer", label: "Printer", beat: 1.83 },
  { id: "computer", label: "Front desk", beat: 1.12 },
  { id: "phone", label: "Phone", beat: 0.58 },
];

const KINDS: FragmentKind[] = ["strip", "photo", "numbers", "note"];

/** Key body length below (or above) the socket. */
export const KEY_LENGTH = 26;

/** Card-relative slots the fragments settle into. */
export const CARD_SLOTS: Record<FragmentKind, { x: number; y: number; w: number; h: number }> = {
  photo: { x: 20, y: 30, w: 80, h: 62 },
  numbers: { x: 115, y: 30, w: 125, h: 28 },
  note: { x: 115, y: 66, w: 125, h: 26 },
  strip: { x: 20, y: 104, w: 220, h: 34 },
};

function stave(sx: number, sy: number, ex: number, ey: number) {
  const my = (sy + ey) / 2;
  return `M${sx} ${sy} C${sx} ${my} ${ex} ${my} ${ex} ${ey}`;
}

function keySlots(box: Layout["box"]) {
  return DEVICES.map((_, i) => ({ x: box.x + 28 + i * ((box.w - 56) / 5), y: box.y + 8 }));
}

function wide(): Layout {
  const frame = { w: 150, h: 118 };
  const card = { x: 470, y: 246, w: 260, h: 160 };
  const box = { x: 520, y: 456, w: 160, h: 70 };
  const devices: Device[] = DEVICES.map((d, i) => {
    const cx = 120 + i * 192;
    const cy = 14 + frame.h / 2;
    return { ...d, cx, cy, socket: { x: cx, y: cy + frame.h / 2 }, flip: false };
  });
  const fragments = devices.flatMap((d, i) =>
    [0, 1].map((k) => ({
      id: `frag-${i}-${k}`,
      kind: KINDS[(i + k * 2) % 4],
      x: d.cx + (k ? 38 : -34) + ((i * 7) % 11),
      y: 184 + ((i * 23 + k * 31) % 40),
      rotate: ((i * 37 + k * 53) % 40) - 20,
    })),
  );
  const staves = devices.map((d, i) => stave(d.socket.x, d.socket.y + KEY_LENGTH, card.x + 40 + i * 36, card.y));
  return { width: 1200, height: 540, frame, devices, fragments, card, box, keySlots: keySlots(box), staves };
}

function tall(): Layout {
  const frame = { w: 168, h: 118 };
  const card = { x: 170, y: 330, w: 260, h: 160 };
  const box = { x: 220, y: 880, w: 160, h: 70 };
  const devices: Device[] = DEVICES.map((d, i) => {
    const cx = 102 + (i % 3) * 198;
    const lower = i >= 3;
    const top = lower ? 650 : 20;
    const cy = top + frame.h / 2;
    return { ...d, cx, cy, socket: { x: cx, y: lower ? top : top + frame.h }, flip: lower };
  });
  const fragments = devices.flatMap((d, i) =>
    [0, 1].map((k) => ({
      id: `frag-${i}-${k}`,
      kind: KINDS[(i + k * 2) % 4],
      x: d.cx + (k ? 36 : -32),
      y: (d.flip ? 548 : 196) + ((i * 23 + k * 31) % 50),
      rotate: ((i * 37 + k * 53) % 40) - 20,
    })),
  );
  const staves = devices.map((d, i) =>
    d.flip
      ? stave(d.socket.x, d.socket.y - KEY_LENGTH, card.x + 60 + (i % 3) * 70, card.y + card.h)
      : stave(d.socket.x, d.socket.y + KEY_LENGTH, card.x + 60 + (i % 3) * 70, card.y),
  );
  return { width: 600, height: 980, frame, devices, fragments, card, box, keySlots: keySlots(box), staves };
}

export const layouts = { wide: wide(), tall: tall() };
