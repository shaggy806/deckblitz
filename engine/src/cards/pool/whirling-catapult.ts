import { defineCard } from "../define.js";

// EDHREC rank 30401.
//
// Rulings:
//   [2008-10-01] If your library has fewer than two cards in it, you can't activate the ability.

export default defineCard({
  name: "Whirling Catapult",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  text: "{2}, Exile the top two cards of your library: This artifact deals 1 damage to each creature with flying and each player.",
  activated: [
    {
      cost: { mana: "{2}", tap: false, exileTop: 2 },
      targets: [],
      effect: {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "damage-all", filter: { type: "creature", keyword: "flying" }, amount: 1 },
          { kind: "damage", amount: 1, who: "each-player" },
        ],
      },
      resolve: null,
      text: "{2}, Exile the top two cards of your library: This artifact deals 1 damage to each creature with flying and each player.",
    },
  ],
});
