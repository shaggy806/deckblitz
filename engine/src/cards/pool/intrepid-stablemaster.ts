import { defineCard } from "../define.js";

// EDHREC rank 10448.
//
// The two mana may go to one Mount or Vehicle spell or two (the ruling):
// each unit carries its own restriction.
const MOUNT_TEXT = "{T}: Add two mana of any one color. Spend this mana only to cast Mount or Vehicle spells.";

export default defineCard({
  name: "Intrepid Stablemaster",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Scout"],
  power: 2,
  toughness: 2,
  keywords: ["reach"],
  text: `Reach\n{T}: Add {G}.\n${MOUNT_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "G", amount: 1 },
      resolve: null,
      text: "{T}: Add {G}.",
    },
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: "any-color",
        amount: 2,
        spendOnly: {
          spell: { subtypes: ["Mount", "Vehicle"] },
          text: "Spend this mana only to cast Mount or Vehicle spells.",
        },
      },
      resolve: null,
      text: MOUNT_TEXT,
    },
  ],
});
