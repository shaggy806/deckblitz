import { defineCard } from "../define.js";

// EDHREC rank 11400.
//
// Rulings:
//   [2019-10-04] The triggered ability can trigger only once each turn. It doesn't matter whether
//     the permanent with that ability was on the battlefield when the first card was drawn.

const DRAW_TEXT = "Whenever you draw your second card each turn, create a 1/1 blue Faerie creature token with flying.";
const LOOT_TEXT = "{4}{U}{R}: Draw a card, then discard a card.";

export default defineCard({
  name: "Improbable Alliance",
  manaCost: "{U}{R}",
  colors: ["U", "R"],
  types: ["enchantment"],
  text: `${DRAW_TEXT}\n${LOOT_TEXT}`,
  activated: [
    {
      cost: { mana: "{4}{U}{R}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [{ kind: "draw", amount: 1 }, { kind: "discard", target: "you", amount: 1 }],
      },
      resolve: null,
      text: LOOT_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "draws", who: "you", nthEachTurn: 2 },
      targets: [],
      effect: { kind: "create-token", token: "Faerie Token", count: 1 },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
});
