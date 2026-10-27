import { defineCard } from "../define.js";

// EDHREC rank 26999.

export default defineCard({
  name: "Cleansing Beam",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Radiance — Cleansing Beam deals 2 damage to target creature and each other creature that shares a color with it.",
  targets: ["creature"],
  effect: { kind: "damage-all", amount: 2, filter: { type: "creature", sharesColorWithTarget: 0 } },
});
