import { defineCard } from "../define.js";

// EDHREC rank 9817.
//
// "Didn't enter this turn" is the `enteredThisTurn: false` filter (Cactuar),
// read as the spell resolves — so whatever it cascaded into and has resolved
// already is spared if it's a creature.
const BURN_TEXT = "Let the Galaxy Burn deals X plus 2 damage to each creature that didn't enter this turn.";

export default defineCard({
  name: "Let the Galaxy Burn",
  manaCost: "{X}{5}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: `Cascade (When you cast this spell, exile cards from the top of your library until you exile a nonland card that costs less. You may cast it without paying its mana cost. Put the exiled cards on the bottom in a random order.)\n${BURN_TEXT}`,
  targets: [],
  effect: {
    kind: "damage-all",
    filter: { type: "creature", enteredThisTurn: false },
    amount: { sum: ["x", 2] },
  },
  triggered: [
    {
      trigger: { on: "this-cast" },
      targets: [],
      effect: { kind: "cascade" },
      resolve: null,
      text: "Cascade",
    },
  ],
});
