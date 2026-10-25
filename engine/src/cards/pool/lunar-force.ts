import { defineCard } from "../define.js";

// The counter isn't an "if you do": the spell is countered even when this
// enchantment is already gone and can't be sacrificed (the rulings).
const TEXT = "When an opponent casts a spell, sacrifice this enchantment and counter that spell.";

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
