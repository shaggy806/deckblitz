import { defineCard } from "../define.js";

const FACES = ["Fire // Ice", "Fire", "Ice"];

// The left half of Fire // Ice (see fire-ice.ts). Chandra's Pyrohelix's shape:
// the division is announced as it's cast (rule 601.2d).
export default defineCard({
  name: "Fire",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Fire deals 2 damage divided as you choose among one or two targets.",
  targets: [{ kind: "any-number", of: "any-target", min: 1, max: 2 }],
  divided: { total: 2, slot: 0 },
  effect: { kind: "damage-divided", from: 0 },
  faces: FACES,
  split: true,
});
