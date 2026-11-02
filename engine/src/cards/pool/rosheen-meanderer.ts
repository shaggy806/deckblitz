import { defineCard } from "../define.js";

// Rulings:
//   [2017-11-17] A "cost that contains {X}" may be a spell's total cost, an activated ability's
//     cost, a suspend cost, or a cost you're asked to pay as part of the resolution of a spell or
//     ability (such as Condescend). A spell's total cost includes either its mana cost or its
//     alternative cost (such as flashback), as well as any additional costs (such as kicker).
//
// `"cost-with-x"` reads the cost actually being paid, not the card's mana cost.

const TEXT = "{T}: Add {C}{C}{C}{C}. Spend this mana only on costs that contain {X}.";

export default defineCard({
  name: "Rosheen Meanderer",
  manaCost: "{3}{R/G}",
  colors: ["R", "G"],
  types: ["creature"],
  supertypes: ["legendary"],
  subtypes: ["Giant", "Shaman"],
  power: 4,
  toughness: 4,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: "C",
        amount: 4,
        spendOnly: {
          purposes: ["cost-with-x"],
          text: "Spend this mana only on costs that contain {X}.",
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
