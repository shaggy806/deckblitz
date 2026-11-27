import { defineCard } from "../define.js";
import type { CardFilter } from "../../filter.js";

// Visions. "Other" is other than the enchanted creature (`hostOfSource:
// false`), read from the Aura; "you" is the Aura's controller, so on an
// opponent's creature it counts and shrinks the Aura controller's creatures.

const ENTERS = "When this Aura enters, draw a card at the beginning of the next turn's upkeep.";
const PUMP = "Enchanted creature gets +1/+1 for each other creature you control.";
const SHRINK = "Other creatures you control get -1/-1.";

const OTHERS: CardFilter = { type: "creature", controlledBy: "you", hostOfSource: false };

export default defineCard({
  name: "Vampirism",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${ENTERS}\n${PUMP}\n${SHRINK}`,
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "delayed-trigger",
        at: { step: "upkeep" },
        text: "Draw a card at the beginning of the next turn's upkeep.",
        effect: { kind: "draw", amount: 1 },
      },
      resolve: null,
      text: ENTERS,
    },
  ],
  static: [
    { affects: { scope: "attached" }, grantPtPerCount: { filter: OTHERS, pt: [1, 1] }, text: PUMP },
    { affects: { scope: "filter", filter: OTHERS }, grantPt: [-1, -1], text: SHRINK },
  ],
});
