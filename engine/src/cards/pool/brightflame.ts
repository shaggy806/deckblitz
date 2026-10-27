import { defineCard } from "../define.js";

// Ravnica: City of Guilds (RAV). Radiance: X damage to the target and each
// other creature sharing a color with it, in one event; the life gained is
// the damage actually dealt (prevented damage was never dealt).

export default defineCard({
  name: "Brightflame",
  manaCost: "{X}{R}{R}{W}{W}",
  colors: ["W", "R"],
  types: ["sorcery"],
  text: "Radiance — Brightflame deals X damage to target creature and each other creature that shares a color with it. You gain life equal to the damage dealt this way.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage-all", amount: "x", filter: { type: "creature", sharesColorWithTarget: 0 } },
      { kind: "gain-life", amount: { damageDealtThisWay: true } },
    ],
  },
});
