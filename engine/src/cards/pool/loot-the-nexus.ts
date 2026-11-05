import { defineCard } from "../define.js";

// Rulings:
//   A creature has different power from another if their powers are different numbers. For example,
//     a 1/1 creature and a 2/1 creature have different powers.

const TEXT = "{T}: Choose a color. Add one mana of that color for each different power among creatures you control.";

export default defineCard({
  name: "Loot, the Nexus",
  manaCost: "{2}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Beast", "Noble"],
  power: 2,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: "any-color",
        amount: { aggregate: "distinct", of: "power", filter: { type: "creature", controlledBy: "you" } },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
