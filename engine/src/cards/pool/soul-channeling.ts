import { defineCard } from "../define.js";

// Mercadian Masques (MMQ). EDHREC rank 16169.

const TEXT = "Pay 2 life: Regenerate enchanted creature.";

export default defineCard({
  name: "Soul Channeling",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${TEXT}`,
  targets: ["creature"],
  activated: [
    {
      cost: { mana: null, tap: false, payLife: 2 },
      targets: [],
      effect: { kind: "regenerate", target: "attached" },
      resolve: null,
      text: TEXT,
    },
  ],
});
