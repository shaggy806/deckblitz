import { defineCard } from "../define.js";

// Core Set 2020. "A Chandra planeswalker spell" is a planeswalker spell with
// the subtype Chandra (the ruling) — not Chandra's Outrage.
const MANA_TEXT = "{T}: Add {R}. Spend this mana only to cast an Elemental spell or a Chandra planeswalker spell.";

export default defineCard({
  name: "Chandra's Embercat",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Elemental", "Cat"],
  power: 2,
  toughness: 2,
  text: MANA_TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: "R",
        amount: 1,
        spendOnly: {
          spell: { anyOf: [{ subtype: "Elemental" }, { type: "planeswalker", subtype: "Chandra" }] },
          text: "Spend this mana only to cast an Elemental spell or a Chandra planeswalker spell.",
        },
      },
      resolve: null,
      text: MANA_TEXT,
    },
  ],
});
