/**
 * The Services hero background: an engineering drawing sheet. A dental
 * implant in half section with hatching, its centre line, dimensions, a
 * thread detail, sheet zones and a title block, on faint grid paper.
 * Every line carries data-draw so the hero can draft it in stroke by stroke.
 * Letters stand in for values: the drawing describes the kind of work, not
 * any real part.
 */

const CX = 1000;
const TOP = 200;
const COLLAR = 280;
const APEX = 700;
const PITCH = 36;

/** Half-width of the body at height y (collar straight, then tapering). */
const half = (y: number) => (y <= COLLAR ? 90 : 92 - ((y - COLLAR) / (650 - COLLAR)) * 28);

/** One side of the outline as points, top to the start of the apex, with the thread teeth. */
function side(dir: 1 | -1): Array<[number, number]> {
  const at = (y: number, extra = 0): [number, number] => [CX + dir * (half(y) + extra), y];
  const points = [at(TOP), at(COLLAR)];
  for (let y = COLLAR; y + PITCH <= 650; y += PITCH) {
    points.push(at(y + PITCH * 0.35, 16), at(y + PITCH * 0.55, 16), at(y + PITCH));
  }
  return points;
}

const path = (points: Array<[number, number]>) => points.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(" L");
const LEFT = side(-1);
const RIGHT = side(1).reverse();
/** Left side down, round the apex, right side up. */
const OUTLINE = `M${path(LEFT)} Q ${CX} ${APEX + 26} ${RIGHT[0][0].toFixed(1)} ${RIGHT[0][1].toFixed(1)} L${path(RIGHT.slice(1))} Z`;

/** The internal bore that takes the abutment screw, with its thread. */
const BORE = (() => {
  let d = `M${CX - 34} ${TOP} L${CX - 34} 250`;
  for (let y = 250; y < 380; y += 14) d += ` L${CX - 26} ${y + 7} L${CX - 34} ${y + 14}`;
  d += ` L${CX - 20} 404 L${CX + 20} 404 L${CX + 34} 390`;
  for (let y = 376; y > 250; y -= 14) d += ` L${CX + 26} ${y - 7} L${CX + 34} ${y - 14}`;
  return `${d} L${CX + 34} ${TOP}`;
})();

const DETAIL = { x: 1340, y: 380, r: 110 };

function Arrow({ x, y, angle }: { x: number; y: number; angle: number }) {
  return <path className="draft__arrow" d="M0 0 L-12 -4 L-12 4 Z" transform={`translate(${x} ${y}) rotate(${angle})`} />;
}

export function DraftingSheet() {
  const zones = Array.from({ length: 8 }, (_, i) => i);
  return (
    <svg className="draft" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <pattern id="draftMinor" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M20 0 H0 V20" className="draft__grid-minor" />
        </pattern>
        <pattern id="draftMajor" width="100" height="100" patternUnits="userSpaceOnUse">
          <rect width="100" height="100" fill="url(#draftMinor)" />
          <path d="M100 0 H0 V100" className="draft__grid-major" />
        </pattern>
        <pattern id="draftHatch" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <path d="M0 0 V12" className="draft__hatch-line" />
        </pattern>
        <clipPath id="draftLeftHalf">
          <rect x="0" y="0" width={CX} height="900" />
        </clipPath>
        <clipPath id="draftBody">
          <path d={OUTLINE} />
        </clipPath>
        <clipPath id="draftDetail">
          <circle cx={DETAIL.x} cy={DETAIL.y} r={DETAIL.r - 2} />
        </clipPath>
        <filter id="draftPaper">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" />
          <feColorMatrix values="0 0 0 0 1  0 0 0 0 0.9  0 0 0 0 0.8  0 0 0 0.05 0" />
        </filter>
      </defs>

      <rect width="1600" height="900" className="draft__paper" />
      <rect width="1600" height="900" fill="url(#draftMajor)" />
      <rect width="1600" height="900" filter="url(#draftPaper)" />

      {/* Sheet border with zone references. */}
      <g className="draft__frame">
        <rect data-draw x="40" y="40" width="1520" height="820" pathLength={1} />
        <rect data-draw x="56" y="56" width="1488" height="788" pathLength={1} />
        {zones.map((i) => (
          <g key={i}>
            <path data-draw d={`M${56 + (i + 1) * 186} 40 V56 M${56 + (i + 1) * 186} 844 V860`} pathLength={1} />
            <text x={56 + i * 186 + 93} y="52" className="draft__zone">
              {i + 1}
            </text>
          </g>
        ))}
        {["A", "B", "C", "D"].map((letter, i) => (
          <text key={letter} x="48" y={56 + i * 197 + 104} className="draft__zone">
            {letter}
          </text>
        ))}
      </g>

      {/* Construction lines, faint and running past the part. */}
      <g className="draft__construction">
        <path data-draw d={`M${CX - 260} ${TOP} H${CX + 330}`} pathLength={1} />
        <path data-draw d={`M${CX - 260} ${COLLAR} H${CX + 140}`} pathLength={1} />
        <path data-draw d={`M${CX - 260} ${APEX} H${CX + 330}`} pathLength={1} />
      </g>

      {/* The part: section hatch on the left half, outline, bore, centre line. */}
      <g clipPath="url(#draftBody)">
        <rect x="0" y="0" width={CX} height="900" fill="url(#draftHatch)" clipPath="url(#draftLeftHalf)" className="draft__hatch" />
      </g>
      <path d={BORE} className="draft__bore-fill" />
      <path data-draw d={OUTLINE} className="draft__part" pathLength={1} />
      <path data-draw d={BORE} className="draft__part draft__part--thin" pathLength={1} />
      <path data-draw d={`M${CX} ${TOP - 60} V${APEX + 60}`} className="draft__centre" pathLength={1} />

      {/* Dimensions. */}
      <g className="draft__dim">
        <path data-draw d={`M${CX - 90} ${TOP - 8} V${TOP - 58} M${CX + 90} ${TOP - 8} V${TOP - 58}`} pathLength={1} />
        <path data-draw d={`M${CX - 90} ${TOP - 42} H${CX + 90}`} pathLength={1} />
        <Arrow x={CX - 90} y={TOP - 42} angle={180} />
        <Arrow x={CX + 90} y={TOP - 42} angle={0} />
        <text x={CX} y={TOP - 52} className="draft__label">
          Ø D
        </text>

        <path data-draw d={`M${CX + 100} ${TOP} H${CX + 214} M${CX + 20} ${APEX} H${CX + 214}`} pathLength={1} />
        <path data-draw d={`M${CX + 196} ${TOP} V${APEX}`} pathLength={1} />
        <Arrow x={CX + 196} y={TOP} angle={-90} />
        <Arrow x={CX + 196} y={APEX} angle={90} />
        <text x={CX + 214} y={(TOP + APEX) / 2} className="draft__label" transform={`rotate(-90 ${CX + 214} ${(TOP + APEX) / 2})`}>
          L
        </text>

        <path data-draw d={`M${CX + 92} ${COLLAR} H${CX + 150} M${CX + 132} ${TOP} V${COLLAR}`} pathLength={1} />
        <text x={CX + 146} y={(TOP + COLLAR) / 2 + 4} className="draft__label draft__label--small">
          C
        </text>
      </g>

      {/* Detail B: the thread profile, enlarged. */}
      <g className="draft__detail">
        <circle data-draw cx={CX + half(470) + 8} cy="470" r="30" pathLength={1} />
        <path data-draw d={`M${CX + half(470) + 34} 452 L${DETAIL.x - DETAIL.r * 0.8} ${DETAIL.y + DETAIL.r * 0.55}`} pathLength={1} />
        <circle data-draw cx={DETAIL.x} cy={DETAIL.y} r={DETAIL.r} pathLength={1} />
        <g clipPath="url(#draftDetail)">
          <path
            data-draw
            className="draft__part"
            d={`M${DETAIL.x - 60} ${DETAIL.y - 130} L${DETAIL.x - 60} ${DETAIL.y - 70} L${DETAIL.x + 10} ${DETAIL.y - 46} L${DETAIL.x + 10} ${DETAIL.y - 24} L${DETAIL.x - 60} ${DETAIL.y} L${DETAIL.x + 10} ${DETAIL.y + 24} L${DETAIL.x + 10} ${DETAIL.y + 46} L${DETAIL.x - 60} ${DETAIL.y + 70} L${DETAIL.x - 60} ${DETAIL.y + 130}`}
            pathLength={1}
          />
          <rect x={DETAIL.x - 200} y={DETAIL.y - 140} width="140" height="280" fill="url(#draftHatch)" className="draft__hatch" />
          <path data-draw d={`M${DETAIL.x + 40} ${DETAIL.y - 70} V${DETAIL.y} M${DETAIL.x + 20} ${DETAIL.y - 70} H${DETAIL.x + 50} M${DETAIL.x + 20} ${DETAIL.y} H${DETAIL.x + 50}`} className="draft__dim-line" pathLength={1} />
          <text x={DETAIL.x + 54} y={DETAIL.y - 30} className="draft__label draft__label--small">
            P
          </text>
        </g>
        <text x={DETAIL.x} y={DETAIL.y + DETAIL.r + 30} className="draft__label draft__label--small">
          Detail B (4:1)
        </text>
      </g>

      <text x={CX} y={APEX + 96} className="draft__label">
        Section A–A
      </text>
      <text x={CX} y={APEX + 118} className="draft__label draft__label--small">
        Scale 5:1
      </text>

      {/* Title block. */}
      <g className="draft__block">
        <path data-draw d="M1240 596 H1544 V728 H1240 Z M1240 640 H1544 M1240 684 H1544 M1432 640 V728" pathLength={1} />
        <text x="1256" y="624" className="draft__block-text draft__block-text--lead">
          <tspan className="brand-name">ChakraVue AI</tspan> · Services
        </text>
        <text x="1256" y="668" className="draft__block-text">
          Biomechanical study
        </text>
        <text x="1446" y="668" className="draft__block-text">
          Sheet 01
        </text>
        <text x="1256" y="712" className="draft__block-text">
          Drawn · CV
        </text>
        <text x="1446" y="712" className="draft__block-text">
          Rev. A
        </text>
      </g>
    </svg>
  );
}
