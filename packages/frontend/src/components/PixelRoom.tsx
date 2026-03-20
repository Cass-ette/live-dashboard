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
// Palettes — two exact-same-key objects for day / night
// ---------------------------------------------------------------------------
const DAY = {
  wall:          "#d8ccb0",
  baseboard:     "#8a6838",
  floor1:        "#c89050",   // plank A
  floor2:        "#b87e3c",   // plank B
  floorLine:     "#9a6228",   // plank separator
  winFrame:      "#8a6030",
  winFrameInner: "#7a5020",
  winGlass:      "#bce0f4",
  winGlassHi:    "#d8f0fc",
  winSun:        "#ffe840",
  curtain:       "#f0a8b4",
  curtainShade:  "#c88898",
  desk:          "#b07838",   // desk top surface
  deskFront:     "#8a5820",   // desk front face (darker = pseudo-3D)
  deskLeg:       "#6a3e10",
  monBezel:      "#a8a890",
  monBezelHi:    "#c0c0a8",   // top-edge highlight pixel
  monBezelShade: "#787860",
  monScreen:     "#060810",
  monGlow:       "#4466ee",
  kbd:           "#909080",
  kbdLine:       "#787068",
  plant:         "#a85828",
  plantDark:     "#7a3e18",
  plantStem:     "#508028",
  leaf1:         "#60a030",
  leaf2:         "#488028",
  leafHi:        "#78c040",
  label:         "#c85848",
  outline:       "#28180a",
};

const NIGHT = {
  wall:          "#16213e",
  baseboard:     "#222050",
  floor1:        "#2c1a0e",
  floor2:        "#241408",
  floorLine:     "#160c04",
  winFrame:      "#1c1a40",
  winFrameInner: "#141232",
  winGlass:      "#080c1c",
  winGlassHi:    "#0c1020",
  winSun:        "#f0e060",   // moon
  curtain:       "#4a1860",
  curtainShade:  "#320e48",
  desk:          "#3a2010",
  deskFront:     "#2a1408",
  deskLeg:       "#1a0c04",
  monBezel:      "#222030",
  monBezelHi:    "#2e2840",
  monBezelShade: "#161020",
  monScreen:     "#020408",
  monGlow:       "#5544ff",
  kbd:           "#1c1828",
  kbdLine:       "#141020",
  plant:         "#5a3010",
  plantDark:     "#3a1e08",
  plantStem:     "#385820",
  leaf1:         "#486020",
  leaf2:         "#304816",
  leafHi:        "#587828",
  label:         "#7733bb",
  outline:       "#06040c",
};

type Colors = typeof DAY;

// ---------------------------------------------------------------------------
// Layout constants
// ---------------------------------------------------------------------------
const RW       = 800;
const RH       = 300;
const FLOOR_Y  = 218;   // y where floor starts
const SLOT_W   = 180;

// Desk (pseudo-3D: top surface + front face)
const DESK_TOP_Y   = FLOOR_Y - 44;  // 174  — desk top surface y
const DESK_SURF_H  = 8;             // thickness of top surface
const DESK_FRONT_H = 28;            // front face height
const DESK_LEG_W   = 8;
// Total desk occupies y = DESK_TOP_Y … FLOOR_Y, so legs go FLOOR_Y-12 to FLOOR_Y

// Monitor (sits on desk top)
const MON_W    = 108;
const MON_H    = 72;
const MON_BZ   = 7;     // bezel thickness
const MON_Y    = DESK_TOP_Y - MON_H - 2;  // top of monitor bezel = 100

// Keyboard (thin rect on desk surface)
const KBD_W    = 80;
const KBD_H    = 8;

function slotCx(i: number, total: number): number {
  const usable = RW - 60;
  const spacing = usable / total;
  return 30 + spacing * i + spacing / 2;
}

// ---------------------------------------------------------------------------
// Room background
// ---------------------------------------------------------------------------
function RoomBackground({ c, isNightMode }: { c: Colors; isNightMode: boolean }) {
  const planks: React.ReactElement[] = [];
  const plankH = 14;
  for (let y = FLOOR_Y; y < RH; y += plankH) {
    const idx = Math.floor((y - FLOOR_Y) / plankH);
    planks.push(
      <rect key={y} x={0} y={y} width={RW} height={Math.min(plankH - 1, RH - y)}
        fill={idx % 2 === 0 ? c.floor1 : c.floor2} />,
      <rect key={`l${y}`} x={0} y={y + plankH - 1} width={RW} height={1}
        fill={c.floorLine} />
    );
  }

  // Window dimensions
  const winX = RW / 2 - 52;
  const winY = 18;
  const winW = 104;
  const winH = 78;
  const fr   = 5;   // outer frame thickness
  const div  = 3;   // inner divider thickness

  return (
    <>
      {/* Wall */}
      <rect x={0} y={0} width={RW} height={FLOOR_Y} fill={c.wall} />

      {/* Baseboard strip */}
      <rect x={0} y={FLOOR_Y - 6} width={RW} height={6} fill={c.baseboard} />
      {/* Baseboard top pixel line (highlight) */}
      <rect x={0} y={FLOOR_Y - 7} width={RW} height={1} fill={c.outline} opacity={0.18} />

      {/* Floor planks */}
      {planks}

      {/* ---- Window ---- */}
      {/* Outer frame */}
      <rect x={winX} y={winY} width={winW} height={winH} fill={c.winFrame} />
      {/* Frame inner highlight on top edge */}
      <rect x={winX} y={winY} width={winW} height={2} fill={c.winFrameInner} opacity={0.5} />
      {/* Glass area */}
      <rect x={winX + fr} y={winY + fr} width={winW - fr * 2} height={winH - fr * 2}
        fill={c.winGlass} />
      {/* Glass top highlight */}
      <rect x={winX + fr} y={winY + fr} width={winW - fr * 2} height={4}
        fill={c.winGlassHi} opacity={0.6} />
      {/* Vertical divider */}
      <rect x={RW / 2 - div / 2} y={winY + fr} width={div} height={winH - fr * 2}
        fill={c.winFrame} />
      {/* Horizontal divider */}
      <rect x={winX + fr} y={winY + fr + (winH - fr * 2) / 2 - div / 2}
        width={winW - fr * 2} height={div} fill={c.winFrame} />

      {/* Sun / Moon */}
      {isNightMode ? (
        <>
          {/* Moon: circle via stacked rects */}
          {[
            [6,4,4],[4,2,8],[2,0,12],[0,-2,14],[2,-4,12],[4,-6,8],[6,-8,4],
          ].map(([dy, dx, w], i) => (
            <rect key={i}
              x={RW / 2 - 20 + dx} y={winY + fr + 12 + dy}
              width={w} height={2} fill={c.winSun} opacity={0.85} />
          ))}
          {/* Stars */}
          <rect x={winX + fr + 48} y={winY + fr + 6}  width={2} height={2} fill="white" opacity={0.7} />
          <rect x={winX + fr + 62} y={winY + fr + 22} width={2} height={2} fill="white" opacity={0.5} />
          <rect x={winX + fr + 36} y={winY + fr + 28} width={2} height={2} fill="white" opacity={0.55} />
        </>
      ) : (
        <>
          {/* Sun: 10px pixel circle */}
          {[
            [6,4,4],[4,2,8],[2,0,12],[0,-2,12],[2,-4,8],[4,-6,4],
          ].map(([dy, dx, w], i) => (
            <rect key={i}
              x={RW / 2 - 16 + dx} y={winY + fr + 8 + dy}
              width={w} height={2} fill={c.winSun} opacity={0.9} />
          ))}
        </>
      )}

      {/* ---- Curtains ---- */}
      {/* Left curtain */}
      <rect x={winX - 22} y={winY - 2} width={26} height={winH + 4} fill={c.curtain} />
      <rect x={winX - 22} y={winY - 2} width={4}  height={winH + 4} fill={c.curtainShade} />
      {/* Left curtain bottom pixel row */}
      <rect x={winX - 22} y={winY + winH + 2} width={26} height={2} fill={c.curtainShade} />
      {/* Right curtain */}
      <rect x={winX + winW - 4} y={winY - 2} width={26} height={winH + 4} fill={c.curtain} />
      <rect x={winX + winW + 18} y={winY - 2} width={4}  height={winH + 4} fill={c.curtainShade} />
      <rect x={winX + winW - 4} y={winY + winH + 2} width={26} height={2} fill={c.curtainShade} />

      {/* Curtain rod (above window) */}
      <rect x={winX - 26} y={winY - 5} width={winW + 52} height={3} fill={c.baseboard} />

      {/* ---- Pixel plant (centered) ---- */}
      <PixelPlant x={RW / 2} y={FLOOR_Y} c={c} />
    </>
  );
}

// ---------------------------------------------------------------------------
// Pixel-art potted plant — rectangles only, no ellipses
// ---------------------------------------------------------------------------
function PixelPlant({ x, y, c }: { x: number; y: number; c: Colors }) {
  const px = x - 14; // left edge of 28px-wide pot
  const py = y - 22; // top edge of pot (sits on floor)
  return (
    <g>
      {/* Pot body */}
      <rect x={px + 2} y={py}      width={24} height={18} fill={c.plant} />
      <rect x={px + 2} y={py}      width={24} height={2}  fill={c.plantDark} opacity={0.5} />
      <rect x={px + 2} y={py + 16} width={24} height={2}  fill={c.plantDark} />
      {/* Pot left/right shading */}
      <rect x={px + 2}  y={py}      width={3} height={18} fill={c.plantDark} opacity={0.3} />
      <rect x={px + 23} y={py}      width={3} height={18} fill={c.plantDark} opacity={0.3} />
      {/* Pot rim */}
      <rect x={px}      y={py - 4}  width={28} height={5}  fill={c.plant} />
      <rect x={px}      y={py - 4}  width={28} height={2}  fill={c.plantDark} opacity={0.4} />

      {/* Stem */}
      <rect x={x - 2} y={py - 22} width={4} height={22} fill={c.plantStem} />

      {/* Leaves — pixel blobs using rows of rects */}
      {/* Left leaf cluster */}
      <rect x={x - 22} y={py - 44} width={16} height={4}  fill={c.leaf2} />
      <rect x={x - 24} y={py - 40} width={20} height={4}  fill={c.leaf1} />
      <rect x={x - 22} y={py - 36} width={16} height={4}  fill={c.leaf1} />
      <rect x={x - 22} y={py - 36} width={4}  height={4}  fill={c.leafHi} opacity={0.5} />
      <rect x={x - 20} y={py - 32} width={10} height={4}  fill={c.leaf2} />

      {/* Right leaf cluster */}
      <rect x={x + 6}  y={py - 48} width={16} height={4}  fill={c.leaf2} />
      <rect x={x + 4}  y={py - 44} width={20} height={4}  fill={c.leaf1} />
      <rect x={x + 6}  y={py - 40} width={16} height={4}  fill={c.leaf1} />
      <rect x={x + 6}  y={py - 40} width={4}  height={4}  fill={c.leafHi} opacity={0.5} />
      <rect x={x + 8}  y={py - 36} width={10} height={4}  fill={c.leaf2} />

      {/* Top leaf cluster (center) */}
      <rect x={x - 8}  y={py - 52} width={16} height={4}  fill={c.leaf2} />
      <rect x={x - 10} y={py - 48} width={20} height={4}  fill={c.leaf1} />
      <rect x={x - 8}  y={py - 44} width={16} height={4}  fill={c.leaf1} />
      <rect x={x - 8}  y={py - 44} width={4}  height={4}  fill={c.leafHi} opacity={0.5} />
    </g>
  );
}

// ---------------------------------------------------------------------------
// Device slot — monitor + desk (no character)
// ---------------------------------------------------------------------------
function DeviceSlot({ device, cx, c }: { device: DeviceState; cx: number; c: Colors }) {
  const online   = device.is_online === 1;
  const emoji    = getEmoji(device.app_name);
  const appLabel = device.app_name ?? "";
  const monLeft  = cx - MON_W / 2;
  const deskLeft = cx - SLOT_W / 2;

  const glowStyle = online
    ? { animation: "pixel-screen-glow 4s ease-in-out infinite" }
    : {};

  return (
    <g opacity={online ? 1 : 0.38}>

      {/* ---- Monitor ---- */}
      {/* Outer bezel */}
      <rect x={monLeft} y={MON_Y} width={MON_W} height={MON_H}
        fill={online ? c.monBezel : c.monBezelShade} />
      {/* Bezel top-edge highlight row */}
      <rect x={monLeft} y={MON_Y} width={MON_W} height={2} fill={c.monBezelHi} />
      {/* Bezel bottom shadow row */}
      <rect x={monLeft} y={MON_Y + MON_H - 2} width={MON_W} height={2}
        fill={c.monBezelShade} />
      {/* Bezel left shadow */}
      <rect x={monLeft + MON_W - 3} y={MON_Y} width={3} height={MON_H}
        fill={c.monBezelShade} />

      {/* Screen area (inset by bezel) */}
      <rect x={monLeft + MON_BZ} y={MON_Y + MON_BZ}
        width={MON_W - MON_BZ * 2} height={MON_H - MON_BZ * 2}
        fill={c.monScreen}
        stroke={online ? c.monGlow : "none"}
        strokeWidth={online ? 2 : 0}
        style={glowStyle}
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
              textOverflow: "ellipsis", maxWidth: "90px",
            }}>{appLabel}</span>
          </div>
        </foreignObject>
      )}

      {/* Monitor stand — neck */}
      <rect x={cx - 4} y={MON_Y + MON_H} width={8} height={6} fill={c.monBezelShade} />
      {/* Stand base */}
      <rect x={cx - 14} y={MON_Y + MON_H + 6} width={28} height={4} fill={c.monBezelShade} />
      <rect x={cx - 14} y={MON_Y + MON_H + 6} width={28} height={2} fill={c.monBezel} />

      {/* Offline zzz above monitor */}
      {!online && (
        <>
          <text x={cx + 10} y={MON_Y - 4}  fontSize={9} fill="#aaa"
            style={{ animation: "pixel-zzz 2s ease-in-out infinite" }}>z</text>
          <text x={cx + 18} y={MON_Y - 12} fontSize={7} fill="#bbb"
            style={{ animation: "pixel-zzz 2s ease-in-out infinite", animationDelay: "0.4s" }}>z</text>
        </>
      )}

      {/* ---- Keyboard on desk surface ---- */}
      <rect x={cx - KBD_W / 2} y={DESK_TOP_Y + 2} width={KBD_W} height={KBD_H}
        fill={c.kbd} />
      {/* Keyboard key rows (2 dark lines = rows of keys) */}
      <rect x={cx - KBD_W / 2 + 2} y={DESK_TOP_Y + 3} width={KBD_W - 4} height={1}
        fill={c.kbdLine} opacity={0.6} />
      <rect x={cx - KBD_W / 2 + 2} y={DESK_TOP_Y + 5} width={KBD_W - 4} height={1}
        fill={c.kbdLine} opacity={0.6} />
      {/* Keyboard right shadow */}
      <rect x={cx + KBD_W / 2 - 2} y={DESK_TOP_Y + 2} width={2} height={KBD_H}
        fill={c.kbdLine} opacity={0.4} />
      {/* Keyboard bottom shadow */}
      <rect x={cx - KBD_W / 2} y={DESK_TOP_Y + KBD_H} width={KBD_W} height={2}
        fill={c.kbdLine} opacity={0.35} />

      {/* ---- Desk ---- */}
      {/* Top surface */}
      <rect x={deskLeft} y={DESK_TOP_Y} width={SLOT_W} height={DESK_SURF_H} fill={c.desk} />
      {/* Top surface highlight on front edge */}
      <rect x={deskLeft} y={DESK_TOP_Y} width={SLOT_W} height={2} fill={c.desk}
        opacity={0.5} />
      {/* Front face (darker = pseudo 3D) */}
      <rect x={deskLeft} y={DESK_TOP_Y + DESK_SURF_H}
        width={SLOT_W} height={DESK_FRONT_H} fill={c.deskFront} />
      {/* Front face bottom shadow */}
      <rect x={deskLeft} y={DESK_TOP_Y + DESK_SURF_H + DESK_FRONT_H - 2}
        width={SLOT_W} height={2} fill={c.outline} opacity={0.2} />

      {/* Legs */}
      <rect x={deskLeft + 6}            y={DESK_TOP_Y + DESK_SURF_H + DESK_FRONT_H}
        width={DESK_LEG_W} height={FLOOR_Y - (DESK_TOP_Y + DESK_SURF_H + DESK_FRONT_H)}
        fill={c.deskLeg} />
      <rect x={deskLeft + SLOT_W - 6 - DESK_LEG_W}
        y={DESK_TOP_Y + DESK_SURF_H + DESK_FRONT_H}
        width={DESK_LEG_W} height={FLOOR_Y - (DESK_TOP_Y + DESK_SURF_H + DESK_FRONT_H)}
        fill={c.deskLeg} />

      {/* ---- Name label ---- */}
      <rect x={cx - 46} y={FLOOR_Y + 10} width={92} height={15}
        fill={online ? c.label : "#555"} opacity={online ? 0.9 : 0.4} />
      {/* Label bottom shadow pixel */}
      <rect x={cx - 46} y={FLOOR_Y + 23} width={92} height={2}
        fill={c.outline} opacity={online ? 0.2 : 0.1} />
      <text x={cx} y={FLOOR_Y + 21} fontSize={8} fill="white"
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
