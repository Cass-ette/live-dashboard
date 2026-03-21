"use client";

import { useState, useEffect } from "react";
import type { DeviceState } from "@/lib/api";

/* ───── Asset paths ───── */
const A = "/pixel-assets/";

/* Detect CJK characters to apply larger font size for DotGothic16 */
const hasCJK = (s: string) => /[\u4e00-\u9fff\u3040-\u309f\u30a0-\u30ff]/.test(s);
const PC_FRAMES = [`${A}PC_FRONT_ON_1.png`, `${A}PC_FRONT_ON_2.png`, `${A}PC_FRONT_ON_3.png`];
const PC_OFF = `${A}PC_FRONT_OFF.png`;
const DESK_IMG = `${A}DESK_FRONT.png`;
const COFFEE_IMG = `${A}COFFEE.png`;
const WHITEBOARD_IMG = `${A}WHITEBOARD.png`;
const SOFA_IMG = `${A}SOFA_SIDE.png`;
const COFFEE_TABLE_IMG = `${A}COFFEE_TABLE.png`;
const PC_SIDE_IMG = `${A}PC_SIDE.png`;
const FLOOR_IMG = `${A}floor_3.png`;

/* ───── Asset pixel dimensions ───── */
const DESK = { w: 48, h: 32 };
const PC = { w: 16, h: 32 };
const COFFEE = { w: 16, h: 16 };
const WHITEBOARD = { w: 32, h: 32 };
const SOFA = { w: 16, h: 32 };
const COFFEE_TBL = { w: 32, h: 32 };

/* ───── Room geometry (SVG viewBox units = asset pixels) ───── */
const WALL_H = 88;
const FLOOR_H = 48;
const ROOM_H = WALL_H + FLOOR_H; // 136
const GROUND_Y = WALL_H;

const SLOT_W = 72;
const DECO_GAP = 32;
const EDGE_PAD = 24;
const MIN_ROOM_W = 240;

/* Wall color (warm beige instead of tile pattern) */
const WALL_COLOR_DAY = "#d8ccb0";
const WALL_COLOR_NIGHT = "#16213e";

/* ───── Decorations ───── */
const WALL_DECOS = [
  { src: `${A}CLOCK.png`, w: 16, h: 32 },
  { src: `${A}SMALL_PAINTING.png`, w: 16, h: 32 },
  { src: `${A}BOOKSHELF.png`, w: 32, h: 16 },
  { src: `${A}HANGING_PLANT.png`, w: 16, h: 32 },
];
const FLOOR_DECOS = [
  { src: `${A}PLANT.png`, w: 16, h: 32 },
  { src: `${A}CACTUS.png`, w: 16, h: 32 },
  { src: `${A}LARGE_PLANT.png`, w: 32, h: 48 },
];

/* ───── Component ───── */
export default function PixelRoom({
  devices,
  isNightMode,
}: {
  devices: DeviceState[];
  isNightMode: boolean;
}) {
  /* Animate PC screen: cycle ON_1 → ON_2 → ON_3 */
  const [frame, setFrame] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setFrame((f) => (f + 1) % 3), 600);
    return () => clearInterval(id);
  }, []);

  const n = Math.max(devices.length, 1);
  const roomW = Math.max(MIN_ROOM_W, EDGE_PAD * 2 + n * SLOT_W + (n + 1) * DECO_GAP);

  const slotCx = (i: number) =>
    EDGE_PAD + DECO_GAP + i * (SLOT_W + DECO_GAP) + SLOT_W / 2;
  const decoCx = (i: number) =>
    EDGE_PAD + i * (SLOT_W + DECO_GAP) + DECO_GAP / 2;

  return (
    <div className="pixel-room-wrapper">
      <svg
        width="100%"
        viewBox={`0 0 ${roomW} ${ROOM_H}`}
        xmlns="http://www.w3.org/2000/svg"
        aria-label="像素风设备活动房间"
        style={{ display: "block", minWidth: 240, imageRendering: "pixelated" }}
      >
        <defs>
          <pattern
            id="floorPat"
            width={16}
            height={16}
            patternUnits="userSpaceOnUse"
            patternTransform={`translate(0,${GROUND_Y})`}
          >
            <image href={FLOOR_IMG} width={16} height={16} />
          </pattern>
        </defs>

        {/* ── Wall & Floor backgrounds ── */}
        <rect x={0} y={0} width={roomW} height={WALL_H} fill={isNightMode ? WALL_COLOR_NIGHT : WALL_COLOR_DAY} />
        {/* Baseboard */}
        <rect x={0} y={GROUND_Y - 4} width={roomW} height={4} fill={isNightMode ? "#1a1838" : "#7a5c2c"} />
        <rect x={0} y={GROUND_Y} width={roomW} height={FLOOR_H} fill="url(#floorPat)" />

        {/* ── Wall decorations: hung above desks, not above plants ── */}
        {devices.map((d, i) => {
          const cx = slotCx(i);
          // Alternate clock and painting above each desk
          const items = [WALL_DECOS[0], WALL_DECOS[1]];
          const item = items[i % items.length];
          // Stagger height slightly: odd slots a bit higher
          const y = i % 2 === 0 ? 4 : 10;
          return (
            <image
              key={`wd${i}`}
              href={item.src}
              x={cx - item.w / 2}
              y={y}
              width={item.w}
              height={item.h}
            />
          );
        })}
        {/* Bookshelf on far left wall, hanging plant on far right */}
        <image
          href={WALL_DECOS[2].src}
          x={EDGE_PAD}
          y={GROUND_Y - DESK.h - WALL_DECOS[2].h + 4}
          width={WALL_DECOS[2].w}
          height={WALL_DECOS[2].h}
        />
        {roomW > MIN_ROOM_W && (
          <image
            href={WALL_DECOS[3].src}
            x={roomW - EDGE_PAD - WALL_DECOS[3].w}
            y={8}
            width={WALL_DECOS[3].w}
            height={WALL_DECOS[3].h}
          />
        )}

        {/* Whiteboard above center gap (cactus area) */}
        {n >= 2 && (
          <image
            href={WHITEBOARD_IMG}
            x={decoCx(Math.floor(n / 2)) - WHITEBOARD.w / 2}
            y={36}
            width={WHITEBOARD.w}
            height={WHITEBOARD.h}
          />
        )}

        {/* ── Floor decorations: plants in gaps between desks ── */}
        {Array.from({ length: n + 1 }, (_, i) => {
          const cx = decoCx(i);
          const item = FLOOR_DECOS[i % FLOOR_DECOS.length];
          return (
            <image
              key={`fd${i}`}
              href={item.src}
              x={cx - item.w / 2}
              y={GROUND_Y - item.h + 6}
              width={item.w}
              height={item.h}
            />
          );
        })}

        {/* ── Corner furniture (sofa left, coffee table right) ── */}
        {roomW > MIN_ROOM_W && (
          <>
            <image
              href={SOFA_IMG}
              x={2}
              y={GROUND_Y - SOFA.h + 24}
              width={SOFA.w}
              height={SOFA.h}
            />
            {/* Coffee table + side-view PC on it */}
            <image
              href={COFFEE_TABLE_IMG}
              x={roomW - COFFEE_TBL.w - 2}
              y={GROUND_Y - COFFEE_TBL.h + 24}
              width={COFFEE_TBL.w}
              height={COFFEE_TBL.h}
            />
            <image
              href={PC_SIDE_IMG}
              x={roomW - COFFEE_TBL.w - 2 + 8}
              y={GROUND_Y - COFFEE_TBL.h + 24 + 4}
              width={16}
              height={32}
            />
          </>
        )}

        {/* ── Device slots (desk + PC) ── */}
        {devices.map((d, i) => {
          const cx = slotCx(i);
          const online = d.is_online === 1;
          const deskX = cx - DESK.w / 2;
          const deskY = GROUND_Y - DESK.h + 8;  // tabletop near ground line, legs in floor
          const pcX = cx - PC.w / 2;
          // Classic PC: main unit sits on desk surface (desk visible starts row 11)
          const pcY = deskY - PC.h + 31;

          // Coffee: sprite has cup in right half (cols 8-15). Place bounding-box left at cx
          // so cup renders at cx+8..cx+15, just right of PC (cx-8..cx+7), no overlap.
          // coffeeY +13 puts the cup within the desk top-surface region (sprite rows 11-25).
          const coffeeX = cx;
          const coffeeY = deskY + 13;

          return (
            <g key={d.device_id} opacity={online ? 1 : 0.45}>
              <image href={DESK_IMG} x={deskX} y={deskY} width={DESK.w} height={DESK.h} />
              <image href={COFFEE_IMG} x={coffeeX} y={coffeeY} width={COFFEE.w} height={COFFEE.h} />
              <image
                href={online ? PC_FRAMES[frame] : PC_OFF}
                x={pcX}
                y={pcY}
                width={PC.w}
                height={PC.h}
              />
              {!online && (
                <text
                  x={pcX + PC.w + 2}
                  y={pcY + 6}
                  fontFamily="'Press Start 2P', monospace"
                  fontSize="5"
                  fill="#888"
                  style={{ animation: "pixel-zzz 2s ease-in-out infinite" }}
                >
                  zzz
                </text>
              )}
            </g>
          );
        })}

        {/* ── Night overlay (behind labels) ── */}
        {isNightMode && (
          <rect
            x={0}
            y={0}
            width={roomW}
            height={ROOM_H}
            fill="#080818"
            opacity={0.5}
            style={{ pointerEvents: "none" }}
          />
        )}

        {/* ── Device labels (pixel font, always on top) ── */}
        {devices.map((d, i) => {
          const cx = slotCx(i);
          const online = d.is_online === 1;
          const labelW = SLOT_W + DECO_GAP;
          return (
            <foreignObject
              key={`lbl-${d.device_id}`}
              x={cx - labelW / 2}
              y={GROUND_Y + 4}
              width={labelW}
              height={FLOOR_H - 8}
            >
              <div
                style={{
                  fontFamily: "'Press Start 2P', 'DotGothic16', monospace",
                  fontSize: "5px",
                  color: online ? "#fff" : "#999",
                  textAlign: "center",
                  background: online ? "rgba(140,45,55,0.85)" : "rgba(50,50,50,0.75)",
                  borderRadius: "2px",
                  padding: "3px 4px",
                  lineHeight: "1.8",
                  overflow: "hidden",
                  WebkitFontSmoothing: "none",
                }}
              >
                <div style={{ fontSize: hasCJK(d.device_name) ? "7px" : "5px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {d.device_name}
                </div>
                {online && d.app_name && (
                  <div style={{ color: "#88ccff", marginTop: "2px", fontSize: hasCJK(d.app_name!) ? "7px" : "5px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {d.app_name}
                  </div>
                )}
              </div>
            </foreignObject>
          );
        })}
      </svg>
    </div>
  );
}
