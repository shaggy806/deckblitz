import { defineCard } from "../define.js";

const FACES = ["Coward // Killer", "Coward", "Killer"];
const KILLER_TEXT =
  "Killer deals 3 damage to target creature and each other creature that shares a creature type with it.";

// One damage event over the target and every creature sharing a creature
// type with it (`sharesCreatureTypeWith: 0` — the target is in even with no
// creature type); only the target is targeted.
export default defineCard({
  name: "Killer",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: KILLER_TEXT,
  targets: ["creature"],
  effect: { kind: "damage-all", filter: { type: "creature", sharesCreatureTypeWith: 0 }, amount: 3 },
  faces: FACES,
  split: true,
});
