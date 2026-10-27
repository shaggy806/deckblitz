import { defineCard } from "../define.js";

// Ravnica: City of Guilds (RAV). Radiance: "those creatures" are the same
// set the untap read — the target and each other creature sharing a color
// with it — and untapping changes no color, so the pump reads it again.

export default defineCard({
  name: "Rally the Righteous",
  manaCost: "{1}{R}{W}",
  colors: ["W", "R"],
  types: ["instant"],
  text: "Radiance — Untap target creature and each other creature that shares a color with it. Those creatures get +2/+0 until end of turn.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "untap-all", filter: { type: "creature", sharesColorWithTarget: 0 } },
      {
        kind: "modify-pt-all",
        filter: { type: "creature", sharesColorWithTarget: 0 },
        power: 2,
        toughness: 0,
        duration: "end-of-turn",
      },
    ],
  },
});
