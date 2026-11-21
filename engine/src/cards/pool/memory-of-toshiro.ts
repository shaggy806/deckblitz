import { defineCard } from "../define.js";

// Life of Toshiro Umezawa's back face.

const TEXT = "{T}, Pay 1 life: Add {B}. Spend this mana only to cast an instant or sorcery spell.";

export default defineCard({
  name: "Memory of Toshiro",
  colors: ["B"],
  types: ["enchantment", "creature"],
  subtypes: ["Human", "Samurai"],
  power: 2,
  toughness: 3,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true, payLife: 1 },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: "B",
        amount: 1,
        spendOnly: {
          spell: { typesAnyOf: ["instant", "sorcery"] },
          text: "Spend this mana only to cast an instant or sorcery spell.",
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
  faces: ["Life of Toshiro Umezawa", "Memory of Toshiro"],
  transform: true,
});
