import { defineCard } from "../define.js";

// Rulings:
//   [2008-10-01] The two creature cards are exiled as a cost. No one can respond to this. If no
//     graveyard has two creature cards in it, the cost can't be paid.

const TEXT = "{1}, Exile two creature cards from a single graveyard: Create a 1/1 green Saproling creature token.";

export default defineCard({
  name: "Night Soil",
  manaCost: "{G}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: TEXT,
  activated: [
    {
      cost: {
        mana: "{1}",
        tap: false,
        exileFromGraveyard: { count: 2, filter: { type: "creature" }, singleGraveyard: true },
      },
      targets: [],
      effect: { kind: "create-token", token: "Saproling Token", count: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
