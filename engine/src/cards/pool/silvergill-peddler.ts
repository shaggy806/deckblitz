import { defineCard } from "../define.js";

// EDHREC rank 18437.
//
// Gran-Gran's loot on becoming tapped, for any reason (attacking, convoke,
// an opponent's tap effect).

const LOOT_TEXT = "Whenever this creature becomes tapped, draw a card, then discard a card.";

export default defineCard({
  name: "Silvergill Peddler",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Merfolk", "Citizen"],
  power: 2,
  toughness: 3,
  text: LOOT_TEXT,
  triggered: [
    {
      trigger: { on: "becomes-tapped", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [{ kind: "draw", amount: 1 }, { kind: "discard", target: "you", amount: 1 }],
      },
      resolve: null,
      text: LOOT_TEXT,
    },
  ],
});
