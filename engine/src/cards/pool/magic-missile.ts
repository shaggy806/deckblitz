import { defineCard } from "../define.js";

// EDHREC rank 13099.
//
// The division is made as the spell is cast, at least 1 to each target, and
// a target gone illegal doesn't send its share elsewhere (the rulings) —
// Electrolyze's `divided` shape.

export default defineCard({
  name: "Magic Missile",
  manaCost: "{1}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  cantBeCountered: true,
  text: "This spell can't be countered.\nMagic Missile deals 3 damage divided as you choose among one, two, or three targets.",
  targets: [{ kind: "any-number", of: "any-target", min: 1, max: 3 }],
  divided: { total: 3, slot: 0 },
  effect: { kind: "damage-divided", from: 0 },
});
