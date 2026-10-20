import { defineCard } from "../define.js";

// EDHREC rank 9843. Modern Horizons 2.
export default defineCard({
  name: "Sudden Edict",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Split second (As long as this spell is on the stack, players can't cast spells or activate abilities that aren't mana abilities.)\nTarget player sacrifices a creature of their choice.",
  splitSecond: true,
  targets: ["player"],
  effect: { kind: "sacrifice", who: "target", filter: { type: "creature" }, count: 1 },
});
