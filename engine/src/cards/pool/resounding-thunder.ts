import { defineCard } from "../define.js";

// EDHREC rank 31066. Shards of Alara.
//
// Rulings:
//   [2022-12-08] You can cycle this card even if there are no legal targets for the triggered
//     ability.
//   [2022-12-08] The cycling ability and the triggered ability are separate.

export default defineCard({
  name: "Resounding Thunder",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["instant"],
  cycling: { cost: "{5}{B}{R}{G}" },
  text: "Resounding Thunder deals 3 damage to any target.\nCycling {5}{B}{R}{G} ({5}{B}{R}{G}, Discard this card: Draw a card.)\nWhen you cycle this card, it deals 6 damage to any target.",
  targets: ["any-target"],
  effect: { kind: "damage", amount: 3, target: 0 },
  triggered: [
    {
      trigger: { on: "this-cycled" },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 6, target: 0 },
      resolve: null,
      text: "When you cycle this card, it deals 6 damage to any target.",
    },
  ],
});
