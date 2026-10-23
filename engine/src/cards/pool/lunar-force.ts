import { defineCard } from "../define.js";

const TEXT = "When an opponent casts a spell, sacrifice this enchantment and counter that spell.";

// Not optional, and the spell is countered even if Lunar Force is already
// gone and can't be sacrificed (the rulings).
export default defineCard({
  name: "Lunar Force",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "opponent" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "sacrifice-source" },
          { kind: "counter", target: "trigger-object" },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
