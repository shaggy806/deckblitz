import { defineCard } from "../define.js";

const COST_TEXT = "As an additional cost to cast this spell, sacrifice half the lands you control, rounded up.";
const MANA_TEXT = 'Lands you control have "{T}: Add three mana of any one color."';

export default defineCard({
  name: "Tectonic Split",
  manaCost: "{4}{G}{G}",
  colors: ["G"],
  types: ["enchantment"],
  keywords: ["hexproof"],
  text: `${COST_TEXT}\nHexproof\n${MANA_TEXT}`,
  additionalCost: {
    also: {
      text: "Sacrifice half the lands you control, rounded up",
      do: {
        kind: "sacrifice",
        who: "you",
        filter: { type: "land" },
        count: { half: { countOf: { type: "land", controlledBy: "you" } }, round: "up" },
      },
    },
  },
  static: [
    {
      affects: { scope: "lands-you-control" },
      grantsActivated: [
        {
          cost: { mana: null, tap: true },
          targets: [],
          effect: { kind: "add-mana", mana: "any-color", amount: 3 },
          resolve: null,
          text: "{T}: Add three mana of any one color.",
        },
      ],
      text: MANA_TEXT,
    },
  ],
});
