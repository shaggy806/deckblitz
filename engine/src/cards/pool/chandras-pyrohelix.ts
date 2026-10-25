import { defineCard } from "../define.js";

// EDHREC rank 13572. Electrolyze's shape: the split is chosen as it's cast,
// at least 1 to each target; a target gone illegal keeps its share undealt
// (the rulings).

export default defineCard({
  name: "Chandra's Pyrohelix",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Chandra's Pyrohelix deals 2 damage divided as you choose among one or two targets.",
  targets: [{ kind: "any-number", of: "any-target", min: 1, max: 2 }],
  divided: { total: 2, slot: 0 },
  effect: { kind: "damage-divided", from: 0 },
});
