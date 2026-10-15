import { defineCard } from "../define.js";

// EDHREC rank 17858.
//
// The Mightstone and Weakstone's restriction: the {U} pays for anything but
// casting a nonartifact spell — abilities included.
const MANA_TEXT = "{T}: Add {U}. This mana can't be spent to cast a nonartifact spell.";

export default defineCard({
  name: "Hydraulic Helper",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["artifact", "creature"],
  subtypes: ["Robot"],
  power: 2,
  toughness: 3,
  keywords: ["defender"],
  text: `Defender\n${MANA_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: "U",
        amount: 1,
        spendOnly: { notSpell: { notTypes: ["artifact"] }, text: "This mana can't be spent to cast a nonartifact spell." },
      },
      resolve: null,
      text: MANA_TEXT,
    },
  ],
});
