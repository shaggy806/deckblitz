import { defineCard } from "../define.js";

const PUMP = "Creatures you control that are enchanted get +1/+1.";
const DIE = "If a creature you control that's enchanted would die, return it to its owner's hand instead.";

export default defineCard({
  name: "Necromancer's Magemark",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${PUMP}\n${DIE}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", controlledBy: "you", enchanted: true } },
      grantPt: [1, 1],
      text: PUMP,
    },
    {
      affects: { scope: "self" },
      replacement: { event: "would-be-put-into-graveyard", from: "battlefield", instead: "hand", filter: { type: "creature", controlledBy: "you", enchanted: true } },
      text: DIE,
    },
  ],
});
