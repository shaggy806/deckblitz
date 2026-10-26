import { defineCard } from "../define.js";

// EDHREC rank 15451.
//
// Rulings:
//   [2013-07-01] If an artifact or enchantment remains on the battlefield because it was
//     regenerated or has indestructible, you won't gain life for it.

export default defineCard({
  name: "Fracturing Gust",
  manaCost: "{2}{G/W}{G/W}{G/W}",
  colors: ["W", "G"],
  types: ["instant"],
  text: "Destroy all artifacts and enchantments. You gain 2 life for each permanent destroyed this way.",
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy-all", filter: { typesAnyOf: ["artifact", "enchantment"] } },
      { kind: "gain-life", amount: { product: [2, { thisWay: "destroyed" }] } },
    ],
  },
});
