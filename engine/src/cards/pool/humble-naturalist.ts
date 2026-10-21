import { defineCard } from "../define.js";

// EDHREC rank 17280. Ikoria: Lair of Behemoths.
//
// Rulings:
//   [2020-04-17] Mana produced by Humble Naturalist can be spent on any part of a creature spell's
//     total cost, including additional costs (such as kicker costs) and alternative costs (such as
//     mutate costs). It can't be spent to pay the costs of abilities of creatures you control.

const MANA_TEXT = "{T}: Add one mana of any color. Spend this mana only to cast a creature spell.";

export default defineCard({
  name: "Humble Naturalist",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Druid"],
  power: 1,
  toughness: 3,
  text: MANA_TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: "any-color",
        amount: 1,
        spendOnly: {
          spell: { type: "creature" },
          text: "Spend this mana only to cast a creature spell.",
        },
      },
      resolve: null,
      text: MANA_TEXT,
    },
  ],
});
