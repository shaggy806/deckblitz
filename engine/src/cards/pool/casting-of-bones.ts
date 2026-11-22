import { defineCard } from "../define.js";

// Alliances (ALL). EDHREC rank 21084.
//
// "Draw three cards, then discard one of them": a `discard` whose `filter` is
// `{ thisWay: "drawn" }` — only a card this trigger drew can be discarded, so a
// short library that drew fewer still discards one of those, and drawing none
// discards nothing.

const DIES_TEXT = "When enchanted creature dies, draw three cards, then discard one of them.";

export default defineCard({
  name: "Casting of Bones",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\n" + DIES_TEXT,
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "dies", who: "attached" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 3 },
          { kind: "discard", target: "you", amount: 1, filter: { thisWay: "drawn" } },
        ],
      },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
