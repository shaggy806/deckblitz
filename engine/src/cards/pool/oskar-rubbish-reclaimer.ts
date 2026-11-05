import { defineCard } from "../define.js";

// EDHREC rank 10661.
//
// Rulings:
//   [2022-04-29] You may cast the spell immediately. You must pay all costs for a spell cast this
//     way.
//   [2022-04-29] X is 0 when determining the mana value of a card in your graveyard.
//   [2022-04-29] The mana value of a land card is 0.

const DISCARD = "Whenever you discard a nonland card, you may cast it from your graveyard.";

export default defineCard({
  name: "Oskar, Rubbish Reclaimer",
  manaCost: "{3}{U}{B}",
  colors: ["U", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 3,
  toughness: 3,
  text: `This spell costs {1} less to cast for each different mana value among cards in your graveyard.\n${DISCARD}`,
  selfCostReduction: {
    // Unconditional: the always-true gate Blasphemous Act uses.
    condition: { kind: "controls", filter: {}, atLeast: 0 },
    reduceGeneric: { aggregate: "distinct", of: "mana-value", filter: { ownedBy: "you" }, in: "graveyards" },
  },
  triggered: [
    {
      trigger: { on: "discards", who: "you", perCard: true, filter: { notTypes: ["land"] } },
      targets: [],
      effect: { kind: "cast-now", target: "trigger-object" },
      resolve: null,
      text: DISCARD,
    },
  ],
});
