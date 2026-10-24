import { defineCard } from "../define.js";

// Magic Origins. EDHREC rank 14969.
//
// Rulings:
//   [2015-06-22] Once you legally activate the last ability, it doesn't matter how many creature
//     cards are in your graveyard as it resolves.
//
// "Activate only if" is the ability's `condition`, checked as it's activated
// (rule 602.5) and not again on resolution.
const DIES_TEXT = "Whenever a creature dies, scry 1.";
const DRAIN_TEXT =
  "{4}{B}: Each opponent loses 2 life and you gain 2 life. Activate only if there are four or more creature cards in your graveyard.";

export default defineCard({
  name: "Shadows of the Past",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: `${DIES_TEXT} (Look at the top card of your library. You may put that card on the bottom.)\n${DRAIN_TEXT}`,
  triggered: [
    {
      trigger: { on: "dies", who: "any", filter: { type: "creature" } },
      targets: [],
      effect: { kind: "scry", amount: 1 },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{4}{B}", tap: false },
      condition: { kind: "cards-in-graveyard", atLeast: 4, filter: { type: "creature" } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "lose-life", amount: 2, who: "each-opponent" },
          { kind: "gain-life", amount: 2 },
        ],
      },
      resolve: null,
      text: DRAIN_TEXT,
    },
  ],
});
