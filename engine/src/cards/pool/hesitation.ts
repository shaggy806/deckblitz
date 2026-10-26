import { defineCard } from "../define.js";

// EDHREC rank 23306.
//
// Rulings:
//   [2004-10-04] Playing a land is not casting a spell, so playing a land will not trigger this
//     card.

const TEXT = "When a player casts a spell, sacrifice this enchantment and counter that spell.";

export default defineCard({
  name: "Hesitation",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "any" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [{ kind: "sacrifice-source" }, { kind: "counter", target: "trigger-object" }],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
