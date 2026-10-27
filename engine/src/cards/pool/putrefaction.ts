import { defineCard } from "../define.js";

// Mercadian Masques (MMQ). EDHREC rank 28057. Oppression's trigger, for a
// green or white spell (Flashfreeze's `anyOf`: a filter's `colors` asks for
// all of them).

const TEXT = "Whenever a player casts a green or white spell, that player discards a card.";

export default defineCard({
  name: "Putrefaction",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "any", filter: { anyOf: [{ colors: ["G"] }, { colors: ["W"] }] } },
      targets: [],
      effect: { kind: "discard", target: "trigger-controller", amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
