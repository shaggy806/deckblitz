import { defineCard } from "../define.js";

const MANA_TEXT = "{T}: Add {U}. Spend this mana only to cast an artifact spell.";

export default defineCard({
  name: "La Forge, Perceptive Engineer",
  manaCost: "{1}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Artificer"],
  power: 1,
  toughness: 4,
  keywords: ["vigilance"],
  text: `Vigilance (Attacking doesn't cause this creature to tap.)\n${MANA_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: "U",
        amount: 1,
        spendOnly: { spell: { type: "artifact" }, text: "Spend this mana only to cast an artifact spell." },
      },
      resolve: null,
      text: MANA_TEXT,
    },
  ],
});
