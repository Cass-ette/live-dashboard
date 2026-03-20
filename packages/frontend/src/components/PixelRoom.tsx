import React from "react";
import type { DeviceState } from "@/lib/api";

// ---------------------------------------------------------------------------
// App emoji map
// ---------------------------------------------------------------------------
const APP_EMOJI: Record<string, string> = {
  "VS Code": "💻", "Xcode": "🔨", "Chrome": "🌐", "Safari": "🧭",
  "Firefox": "🦊", "Terminal": "⬛", "Finder": "📁", "Spotify": "🎵",
  "YouTube": "▶️", "Steam": "🎮", "Discord": "💬", "Slack": "💬",
  "Figma": "🎨", "Notion": "📝", "Obsidian": "🗒️",
};
function getEmoji(appName: string | null | undefined): string {
  return appName ? (APP_EMOJI[appName] ?? "💻") : "💻";
}

// ---------------------------------------------------------------------------
// PIXEL GRID — all coordinates and sizes are multiples of P (4px)
// ---------------------------------------------------------------------------
const P = 4; // 1 pixel unit = 4 SVG units
const g = (n: number) => n * P; // grid helper: g(3) = 12

// Canvas: 200×72 pixel-units = 800×288 SVG units
const RW = g(200);
const RH = g(72);

// Room structure (in pixel-units, then converted)
const WALL_H    = g(52);   // wall height (top to floor)
const FLOOR_Y   = WALL_H;  // 208 — where floor starts
const BASE_H    = g(2);    // baseboard height = 8px
const BASE_Y    = FLOOR_Y - BASE_H; // 200

// Desk (in pixel-units, on grid)
const DESK_TOP_Y   = FLOOR_Y - g(11);  // 164 — desk surface top
const DESK_SURF_H  = g(2);             // 8  — surface thickness
const DESK_FRONT_H = g(7);             // 28 — front face height
const DESK_LEG_H   = g(2);             // 8  — leg height below front
const DESK_LEG_W   = g(2);             // 8  — leg width
const DESK_W       = g(44);            // 176 — full desk width

// Monitor
const MON_BZ    = g(2);       // 8  — bezel thickness
const MON_W     = g(28);      // 112
const MON_H     = g(18);      // 72
const MON_Y     = DESK_TOP_Y - MON_H - g(1); // top of monitor = 84

// Keyboard (on desk surface)
const KBD_W = g(20); // 80
const KBD_H = g(2);  // 8

// Window (centered, in pixel units)
const WIN_X  = g(47);  // 188
const WIN_Y  = g(3);   // 12
const WIN_W  = g(26);  // 104
const WIN_H  = g(19);  // 76
const WIN_FR = g(1);   // 4  — frame thickness

// ---------------------------------------------------------------------------
// Palettes — strictly 3-shade-per-object + universal dark outline
// ---------------------------------------------------------------------------
const DAY = {
  // Wall: parchment
  wall:         "#d8ccb0",
  wallHi:       "#e8dcbc",  // top-edge highlight row
  // Baseboard: dark wood
  base:         "#7a5c2c",
  baseHi:       "#8a6c3c",
  baseSh:       "#5a3c10",
  // Floor planks A / B (alternating)
  plankA:       "#c89050",
  plankAHi:     "#d8a060",
  plankASh:     "#a87030",
  plankB:       "#b87e3c",
  plankBHi:     "#c88e4c",
  plankBSh:     "#986820",
  // Window frame: wood
  winFr:        "#8a6030",
  winFrHi:      "#a07840",
  winFrSh:      "#5a3c10",
  // Window glass: sky
  glass:        "#b8dcf0",
  glassHi:      "#d8f0fc",
  glassSh:      "#88b8d8",
  // Sun
  sun:          "#ffe840",
  sunHi:        "#fff8a0",
  sunSh:        "#e0c820",
  // Curtain: pink
  curt:         "#f0a8b4",
  curtHi:       "#fcc0c8",
  curtSh:       "#c07888",
  // Desk: warm wood
  desk:         "#b07838",
  deskHi:       "#c88848",
  deskSh:       "#804c10",
  // Desk front face
  deskF:        "#8a5820",
  deskFHi:      "#9a6830",
  deskFSh:      "#5a3008",
  // Monitor bezel: grey
  bezel:        "#a0a090",
  bezelHi:      "#c0c0b0",
  bezelSh:      "#707060",
  // Screen
  screen:       "#060810",
  screenGlow:   "#4466ee",
  // Keyboard
  kbd:          "#909080",
  kbdHi:        "#a8a898",
  kbdSh:        "#686858",
  // Plant pot: terracotta
  pot:          "#b06030",
  potHi:        "#c87040",
  potSh:        "#804010",
  // Plant stem + leaves
  stem:         "#508028",
  leaf:         "#68a830",
  leafHi:       "#88c840",
  leafSh:       "#407818",
  // Label
  label:        "#c84840",
  labelHi:      "#e06050",
  labelSh:      "#902820",
  // Universal 1px outline
  ink:          "#281808",
};

const NIGHT = {
  wall:         "#16213e",
  wallHi:       "#1e2a4e",
  base:         "#1a1838",
  baseHi:       "#222050",
  baseSh:       "#0e0e28",
  plankA:       "#2c1a0e",
  plankAHi:     "#3c2a1c",
  plankASh:     "#180e06",
  plankB:       "#241408",
  plankBHi:     "#342414",
  plankBSh:     "#120a04",
  winFr:        "#1c1840",
  winFrHi:      "#2c2850",
  winFrSh:      "#0c0c28",
  glass:        "#080c1e",
  glassHi:      "#10142a",
  glassSh:      "#04060e",
  sun:          "#f0e060",  // moon
  sunHi:        "#fffaaa",
  sunSh:        "#c0b030",
  curt:         "#4a1860",
  curtHi:       "#5a2870",
  curtSh:       "#2a0840",
  desk:         "#3a2010",
  deskHi:       "#4a2c18",
  deskSh:       "#200c04",
  deskF:        "#2a1408",
  deskFHi:      "#3a2010",
  deskFSh:      "#160804",
  bezel:        "#222030",
  bezelHi:      "#302e40",
  bezelSh:      "#141020",
  screen:       "#020408",
  screenGlow:   "#5544ff",
  kbd:          "#1c1828",
  kbdHi:        "#282438",
  kbdSh:        "#100c18",
  pot:          "#5a3010",
  potHi:        "#6a3c18",
  potSh:        "#361808",
  stem:         "#385820",
  leaf:         "#486028",
  leafHi:       "#587830",
  leafSh:       "#283c10",
  label:        "#7733bb",
  labelHi:      "#9944cc",
  labelSh:      "#4e1888",
  ink:          "#060408",
};

type Colors = typeof DAY;

// ---------------------------------------------------------------------------
// Slot x-center distribution
// ---------------------------------------------------------------------------
function slotCx(i: number, total: number): number {
  // align to pixel grid
  const usable  = RW - g(16);
  const spacing = usable / total;
  const raw     = g(8) + spacing * i + spacing / 2;
  return Math.round(raw / P) * P; // snap to grid
}

// ---------------------------------------------------------------------------
// Room background
// ---------------------------------------------------------------------------
function RoomBackground({ c, isNightMode }: { c: Colors; isNightMode: boolean }) {

  // Floor planks — alternating every P*3 (12px = 3 pixel-units)
  const plankH = g(3); // 12px per plank
  const planks: React.ReactElement[] = [];
  for (let py = FLOOR_Y; py < RH - P; py += plankH) {
    const idx  = Math.floor((py - FLOOR_Y) / plankH);
    const even = idx % 2 === 0;
    planks.push(
      // shadow row at bottom of each plank
      <rect key={`ps${py}`} x={0} y={py} width={RW} height={plankH}
        fill={even ? c.plankA : c.plankB} />,
      // highlight row at top
      <rect key={`ph${py}`} x={0} y={py} width={RW} height={P}
        fill={even ? c.plankAHi : c.plankBHi} />,
      // shadow row at bottom
      <rect key={`pd${py}`} x={0} y={py + plankH - P} width={RW} height={P}
        fill={even ? c.plankASh : c.plankBSh} />,
    );
  }
  // Final floor row shadow at bottom edge
  planks.push(
    <rect key="floor-end" x={0} y={RH - P} width={RW} height={P} fill={c.ink} opacity={0.15} />
  );

  // Window inner glass pane positions
  const gx  = WIN_X + WIN_FR;
  const gy  = WIN_Y + WIN_FR;
  const gw  = WIN_W - WIN_FR * 2;
  const gh  = WIN_H - WIN_FR * 2;
  const midX = WIN_X + WIN_W / 2 - WIN_FR / 2;
  const midY = WIN_Y + WIN_H / 2 - WIN_FR / 2;

  return (
    <>
      {/* ---- Wall ---- */}
      <rect x={0} y={0} width={RW} height={WALL_H} fill={c.wall} />
      {/* Wall top highlight row */}
      <rect x={0} y={0} width={RW} height={P} fill={c.wallHi} />

      {/* ---- Baseboard ---- */}
      {/* outline top */}
      <rect x={0} y={BASE_Y - P} width={RW} height={P}   fill={c.ink} opacity={0.25} />
      <rect x={0} y={BASE_Y}     width={RW} height={P}   fill={c.baseHi} />
      <rect x={0} y={BASE_Y + P} width={RW} height={P}   fill={c.base} />
      <rect x={0} y={BASE_Y + BASE_H - P} width={RW} height={P} fill={c.baseSh} />

      {/* ---- Floor ---- */}
      {planks}

      {/* ---- Window frame (outline first, then frame color) ---- */}
      <rect x={WIN_X - P} y={WIN_Y - P} width={WIN_W + P * 2} height={WIN_H + P * 2}
        fill={c.ink} />
      <rect x={WIN_X} y={WIN_Y} width={WIN_W} height={WIN_H} fill={c.winFr} />
      {/* Frame hi on top/left, shadow on bottom/right */}
      <rect x={WIN_X} y={WIN_Y}          width={WIN_W}    height={P} fill={c.winFrHi} />
      <rect x={WIN_X} y={WIN_Y}          width={P}        height={WIN_H} fill={c.winFrHi} />
      <rect x={WIN_X + WIN_W - P} y={WIN_Y} width={P}    height={WIN_H} fill={c.winFrSh} />
      <rect x={WIN_X} y={WIN_Y + WIN_H - P} width={WIN_W} height={P} fill={c.winFrSh} />

      {/* Glass panes */}
      <rect x={gx} y={gy} width={gw} height={gh} fill={c.glass} />
      <rect x={gx} y={gy} width={gw} height={P}  fill={c.glassHi} />
      <rect x={gx} y={gy} width={P}  height={gh} fill={c.glassHi} />
      <rect x={gx + gw - P} y={gy} width={P} height={gh} fill={c.glassSh} />
      <rect x={gx} y={gy + gh - P}  width={gw} height={P} fill={c.glassSh} />

      {/* Vertical divider */}
      <rect x={midX} y={gy} width={WIN_FR} height={gh} fill={c.winFr} />
      <rect x={midX} y={gy} width={P}      height={gh} fill={c.winFrHi} />
      {/* Horizontal divider */}
      <rect x={gx} y={midY} width={gw} height={WIN_FR} fill={c.winFr} />
      <rect x={gx} y={midY} width={gw} height={P}      fill={c.winFrHi} />

      {/* Sun or Moon (pixel circle via rows of rects) */}
      {isNightMode ? (
        <PixelMoon x={WIN_X + g(5)} y={WIN_Y + g(3)} c={c} />
      ) : (
        <PixelSun x={WIN_X + g(4)} y={WIN_Y + g(3)} c={c} />
      )}

      {/* ---- Curtains ---- */}
      {/* Left: outline, hi column, base, sh column */}
      <rect x={WIN_X - g(7) - P} y={WIN_Y - P} width={g(7) + P * 2} height={WIN_H + P * 2}
        fill={c.ink} />
      <rect x={WIN_X - g(7)} y={WIN_Y}    width={g(7)} height={WIN_H} fill={c.curt} />
      <rect x={WIN_X - g(7)} y={WIN_Y}    width={P}    height={WIN_H} fill={c.curtHi} />
      <rect x={WIN_X - g(7)} y={WIN_Y}    width={g(7)} height={P}     fill={c.curtHi} />
      <rect x={WIN_X - P}    y={WIN_Y}    width={P}    height={WIN_H} fill={c.curtSh} />
      {/* Curtain folds: alternating shade columns */}
      {[g(2), g(4)].map(ox => (
        <rect key={ox} x={WIN_X - g(7) + ox} y={WIN_Y} width={P} height={WIN_H}
          fill={c.curtSh} opacity={0.35} />
      ))}

      {/* Right curtain */}
      <rect x={WIN_X + WIN_W - P} y={WIN_Y - P} width={g(7) + P * 2} height={WIN_H + P * 2}
        fill={c.ink} />
      <rect x={WIN_X + WIN_W}     y={WIN_Y} width={g(7)} height={WIN_H} fill={c.curt} />
      <rect x={WIN_X + WIN_W}     y={WIN_Y} width={P}    height={WIN_H} fill={c.curtHi} />
      <rect x={WIN_X + WIN_W}     y={WIN_Y} width={g(7)} height={P}     fill={c.curtHi} />
      <rect x={WIN_X + WIN_W + g(7) - P} y={WIN_Y} width={P} height={WIN_H} fill={c.curtSh} />
      {[g(2), g(4)].map(ox => (
        <rect key={ox} x={WIN_X + WIN_W + ox} y={WIN_Y} width={P} height={WIN_H}
          fill={c.curtSh} opacity={0.35} />
      ))}

      {/* Curtain rod */}
      <rect x={WIN_X - g(8)} y={WIN_Y - g(2)} width={WIN_W + g(16)} height={g(1)} fill={c.ink} opacity={0.5} />
      <rect x={WIN_X - g(8)} y={WIN_Y - g(2) + P} width={WIN_W + g(16)} height={P} fill={c.base} />

      {/* ---- Plant (centered between slots) ---- */}
      <PixelPlant x={RW / 2} y={FLOOR_Y} c={c} />
    </>
  );
}

// Pixel circle for sun (diameter ~6 pixel-units = 24px)
function PixelSun({ x, y, c }: { x: number; y: number; c: Colors }) {
  // Row offsets (dx, width) for each 2-unit tall row, making a ~6u circle
  const rows = [
    [g(2), g(2)],
    [g(1), g(4)],
    [0,    g(6)],
    [0,    g(6)],
    [g(1), g(4)],
    [g(2), g(2)],
  ];
  return (
    <g>
      {rows.map(([dx, w], i) => (
        <rect key={i} x={x + dx} y={y + i * g(2)} width={w} height={g(2)}
          fill={i === 0 || i === 1 ? c.sunHi : i >= 4 ? c.sunSh : c.sun} />
      ))}
    </g>
  );
}

// Pixel crescent moon
function PixelMoon({ x, y, c }: { x: number; y: number; c: Colors }) {
  const rows: [number, number][] = [
    [g(2), g(2)],
    [g(1), g(3)],
    [0,    g(3)],
    [0,    g(2)],
    [g(1), g(2)],
    [g(2), g(2)],
  ];
  return (
    <g>
      {rows.map(([dx, w], i) => (
        <rect key={i} x={x + dx} y={y + i * g(2)} width={w} height={g(2)}
          fill={i <= 1 ? c.sunHi : c.sun} opacity={0.88} />
      ))}
      {/* Stars */}
      <rect x={x + g(7)}  y={y + g(1)} width={P} height={P} fill="white" opacity={0.7} />
      <rect x={x + g(10)} y={y + g(5)} width={P} height={P} fill="white" opacity={0.5} />
      <rect x={x + g(5)}  y={y + g(8)} width={P} height={P} fill="white" opacity={0.55} />
    </g>
  );
}

// Pixel-art potted plant (all rects, strict grid)
function PixelPlant({ x, y, c }: { x: number; y: number; c: Colors }) {
  const px = x - g(5);  // pot left edge (10 units wide)
  const py = y - g(6);  // pot top (6 units tall)
  return (
    <g>
      {/* Pot outline */}
      <rect x={px - P} y={py - P} width={g(10) + P * 2} height={g(6) + P * 2} fill={c.ink} />
      {/* Pot base */}
      <rect x={px}     y={py}     width={g(10)} height={g(6)} fill={c.pot} />
      <rect x={px}     y={py}     width={g(10)} height={P}    fill={c.potHi} />
      <rect x={px}     y={py}     width={P}     height={g(6)} fill={c.potHi} />
      <rect x={px + g(10) - P} y={py} width={P} height={g(6)} fill={c.potSh} />
      <rect x={px}     y={py + g(6) - P} width={g(10)} height={P} fill={c.potSh} />
      {/* Pot rim (wider) */}
      <rect x={px - g(1) - P} y={py - g(1) - P}
        width={g(12) + P * 2} height={g(2) + P * 2} fill={c.ink} />
      <rect x={px - g(1)} y={py - g(1)} width={g(12)} height={g(2)} fill={c.pot} />
      <rect x={px - g(1)} y={py - g(1)} width={g(12)} height={P}    fill={c.potHi} />

      {/* Stem */}
      <rect x={x - P} y={py - g(12)} width={g(2)} height={g(12)} fill={c.stem} />

      {/* Leaves: three pixel blobs (left, right, top-center) */}
      {/* Left leaf */}
      <PixelLeaf x={x - g(10)} y={py - g(18)} c={c} />
      {/* Right leaf */}
      <PixelLeaf x={x + g(2)} y={py - g(20)} c={c} />
      {/* Top leaf */}
      <PixelLeaf x={x - g(4)} y={py - g(24)} c={c} />
    </g>
  );
}

// Single pixel-art leaf blob (8×8 pixel-units)
function PixelLeaf({ x, y, c }: { x: number; y: number; c: Colors }) {
  // Rows: [dx, width] — forms a rounded blob shape
  const shape: [number, number][] = [
    [g(2), g(4)],
    [g(1), g(6)],
    [0,    g(8)],
    [0,    g(8)],
    [g(1), g(6)],
    [g(2), g(4)],
  ];
  return (
    <g>
      {/* Outline */}
      {shape.map(([dx, w], i) => (
        <rect key={`lo${i}`} x={x + dx - P} y={y + i * g(2) - P} width={w + P * 2} height={g(2) + P * 2}
          fill={c.ink} />
      ))}
      {/* Fill */}
      {shape.map(([dx, w], i) => (
        <rect key={`lf${i}`} x={x + dx} y={y + i * g(2)} width={w} height={g(2)}
          fill={i <= 1 ? c.leafHi : i >= 4 ? c.leafSh : c.leaf} />
      ))}
    </g>
  );
}

// ---------------------------------------------------------------------------
// Device slot
// ---------------------------------------------------------------------------
function DeviceSlot({ device, cx, c }: { device: DeviceState; cx: number; c: Colors }) {
  const online   = device.is_online === 1;
  const emoji    = getEmoji(device.app_name);
  const appLabel = device.app_name ?? "";
  const monLeft  = cx - MON_W / 2;
  const deskLeft = cx - DESK_W / 2;

  return (
    <g opacity={online ? 1 : 0.38}>

      {/* ---- Monitor bezel (outline + bezel + screen) ---- */}
      {/* Outer ink outline */}
      <rect x={monLeft - P} y={MON_Y - P} width={MON_W + P * 2} height={MON_H + P * 2}
        fill={c.ink} />
      {/* Bezel body */}
      <rect x={monLeft} y={MON_Y} width={MON_W} height={MON_H} fill={c.bezel} />
      {/* Bezel hi: top + left */}
      <rect x={monLeft} y={MON_Y}          width={MON_W} height={P} fill={c.bezelHi} />
      <rect x={monLeft} y={MON_Y}          width={P}     height={MON_H} fill={c.bezelHi} />
      {/* Bezel sh: bottom + right */}
      <rect x={monLeft + MON_W - P} y={MON_Y} width={P} height={MON_H} fill={c.bezelSh} />
      <rect x={monLeft} y={MON_Y + MON_H - P} width={MON_W} height={P} fill={c.bezelSh} />

      {/* Screen inset (bezel thickness = MON_BZ) */}
      <rect x={monLeft + MON_BZ} y={MON_Y + MON_BZ}
        width={MON_W - MON_BZ * 2} height={MON_H - MON_BZ * 2}
        fill={c.screen}
        stroke={online ? c.screenGlow : "none"}
        strokeWidth={online ? P : 0}
        style={online ? { animation: "pixel-screen-glow 4s ease-in-out infinite" } : {}}
      />

      {/* Screen content */}
      {online && (
        <foreignObject
          x={monLeft + MON_BZ} y={MON_Y + MON_BZ}
          width={MON_W - MON_BZ * 2} height={MON_H - MON_BZ * 2}
        >
          {/* @ts-expect-error: xmlns required for SVG foreignObject children */}
          <div xmlns="http://www.w3.org/1999/xhtml" style={{
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            height: "100%", overflow: "hidden", userSelect: "none",
          }}>
            <span style={{ fontSize: "22px", lineHeight: "1" }}>{emoji}</span>
            <span style={{
              fontSize: "7px", color: "#88aaff", marginTop: "3px",
              whiteSpace: "nowrap", overflow: "hidden",
              textOverflow: "ellipsis", maxWidth: "88px",
            }}>{appLabel}</span>
          </div>
        </foreignObject>
      )}

      {/* Monitor neck */}
      <rect x={cx - g(1)} y={MON_Y + MON_H}     width={g(2)} height={g(2)} fill={c.bezelSh} />
      {/* Monitor foot */}
      <rect x={cx - g(4) - P} y={MON_Y + MON_H + g(2) - P}
        width={g(8) + P * 2} height={g(1) + P * 2} fill={c.ink} />
      <rect x={cx - g(4)} y={MON_Y + MON_H + g(2)}
        width={g(8)} height={g(1)} fill={c.bezel} />

      {/* Offline zzz */}
      {!online && (
        <>
          <text x={cx + g(4)} y={MON_Y - g(1)} fontSize={g(3)} fill="#888"
            style={{ animation: "pixel-zzz 2s ease-in-out infinite" }}>z</text>
          <text x={cx + g(6)} y={MON_Y - g(4)} fontSize={g(2)} fill="#aaa"
            style={{ animation: "pixel-zzz 2s ease-in-out infinite", animationDelay: "0.4s" }}>z</text>
        </>
      )}

      {/* ---- Keyboard (on desk surface) ---- */}
      {/* outline */}
      <rect x={cx - KBD_W / 2 - P} y={DESK_TOP_Y - P}
        width={KBD_W + P * 2} height={KBD_H + P * 2} fill={c.ink} />
      <rect x={cx - KBD_W / 2} y={DESK_TOP_Y} width={KBD_W} height={KBD_H} fill={c.kbd} />
      <rect x={cx - KBD_W / 2} y={DESK_TOP_Y} width={KBD_W} height={P}     fill={c.kbdHi} />
      <rect x={cx - KBD_W / 2} y={DESK_TOP_Y} width={P}     height={KBD_H} fill={c.kbdHi} />
      <rect x={cx + KBD_W / 2 - P} y={DESK_TOP_Y} width={P} height={KBD_H} fill={c.kbdSh} />
      {/* Key rows (2 rows of small rects) */}
      {[g(1), g(3)].map(oy => (
        <React.Fragment key={oy}>
          {Array.from({ length: 8 }, (_, ki) => (
            <rect key={ki}
              x={cx - KBD_W / 2 + g(1) + ki * g(2) + (oy === g(3) ? g(1) : 0)}
              y={DESK_TOP_Y + oy} width={P} height={P} fill={c.kbdSh} opacity={0.5} />
          ))}
        </React.Fragment>
      ))}

      {/* ---- Desk top surface ---- */}
      {/* outline */}
      <rect x={deskLeft - P} y={DESK_TOP_Y + DESK_SURF_H - P}
        width={DESK_W + P * 2} height={DESK_SURF_H + P * 2} fill={c.ink} />
      {/* Wait, top surface is already partially behind keyboard. Draw the surface AROUND the monitor stand area */}
      <rect x={deskLeft} y={DESK_TOP_Y + DESK_SURF_H} width={DESK_W} height={P}
        fill={c.desk} />

      {/* Desk surface (full width, behind keyboard/monitor) */}
      <rect x={deskLeft - P} y={DESK_TOP_Y - P}
        width={DESK_W + P * 2} height={DESK_SURF_H + P * 2} fill={c.ink} />
      <rect x={deskLeft} y={DESK_TOP_Y} width={DESK_W} height={DESK_SURF_H} fill={c.desk} />
      <rect x={deskLeft} y={DESK_TOP_Y} width={DESK_W} height={P}           fill={c.deskHi} />
      <rect x={deskLeft} y={DESK_TOP_Y} width={P}      height={DESK_SURF_H} fill={c.deskHi} />
      <rect x={deskLeft + DESK_W - P} y={DESK_TOP_Y} width={P} height={DESK_SURF_H}
        fill={c.deskSh} />

      {/* Desk front face */}
      <rect x={deskLeft - P} y={DESK_TOP_Y + DESK_SURF_H - P}
        width={DESK_W + P * 2} height={DESK_FRONT_H + P * 2} fill={c.ink} />
      <rect x={deskLeft} y={DESK_TOP_Y + DESK_SURF_H}
        width={DESK_W} height={DESK_FRONT_H} fill={c.deskF} />
      <rect x={deskLeft} y={DESK_TOP_Y + DESK_SURF_H} width={DESK_W} height={P}
        fill={c.deskFHi} />
      <rect x={deskLeft} y={DESK_TOP_Y + DESK_SURF_H} width={P} height={DESK_FRONT_H}
        fill={c.deskFHi} />
      <rect x={deskLeft + DESK_W - P} y={DESK_TOP_Y + DESK_SURF_H}
        width={P} height={DESK_FRONT_H} fill={c.deskFSh} />
      <rect x={deskLeft} y={DESK_TOP_Y + DESK_SURF_H + DESK_FRONT_H - P}
        width={DESK_W} height={P} fill={c.deskFSh} />

      {/* Desk legs */}
      {[deskLeft + g(2), deskLeft + DESK_W - g(2) - DESK_LEG_W].map((lx, i) => (
        <g key={i}>
          <rect x={lx - P} y={DESK_TOP_Y + DESK_SURF_H + DESK_FRONT_H - P}
            width={DESK_LEG_W + P * 2} height={DESK_LEG_H + P * 2} fill={c.ink} />
          <rect x={lx} y={DESK_TOP_Y + DESK_SURF_H + DESK_FRONT_H}
            width={DESK_LEG_W} height={DESK_LEG_H} fill={c.deskSh} />
          <rect x={lx} y={DESK_TOP_Y + DESK_SURF_H + DESK_FRONT_H}
            width={P} height={DESK_LEG_H} fill={c.deskF} />
        </g>
      ))}

      {/* ---- Name label ---- */}
      {/* Pixel-style label: 1px ink outline + 3-shade fill */}
      <rect x={cx - g(12) - P} y={FLOOR_Y + g(2) - P}
        width={g(24) + P * 2} height={g(4) + P * 2} fill={c.ink} />
      <rect x={cx - g(12)} y={FLOOR_Y + g(2)} width={g(24)} height={g(4)}
        fill={online ? c.label : "#444"} />
      <rect x={cx - g(12)} y={FLOOR_Y + g(2)} width={g(24)} height={P}
        fill={online ? c.labelHi : "#666"} />
      <rect x={cx - g(12)} y={FLOOR_Y + g(2) + g(4) - P} width={g(24)} height={P}
        fill={online ? c.labelSh : "#2a2a2a"} />
      <text x={cx} y={FLOOR_Y + g(2) + g(3)} fontSize={g(3)} fill="white"
        textAnchor="middle" fontFamily="monospace" fontWeight="bold">
        {device.device_name} {online ? "●" : "○"}
      </text>
    </g>
  );
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------
export default function PixelRoom({
  devices,
  isNightMode,
}: {
  devices: DeviceState[];
  isNightMode: boolean;
}) {
  const c     = isNightMode ? NIGHT : DAY;
  const total = Math.max(devices.length, 1);

  return (
    <div className="pixel-room-wrapper">
      <svg
        width="100%"
        viewBox={`0 0 ${RW} ${RH}`}
        xmlns="http://www.w3.org/2000/svg"
        aria-label="像素风设备活动房间"
        style={{ display: "block", minWidth: "240px", imageRendering: "pixelated" }}
      >
        <RoomBackground c={c} isNightMode={isNightMode} />
        {devices.map((device, i) => (
          <DeviceSlot
            key={device.device_id}
            device={device}
            cx={slotCx(i, total)}
            c={c}
          />
        ))}
      </svg>
    </div>
  );
}
