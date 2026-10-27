import { defineCard } from "../define.js";

// EDHREC rank 15650.
//
// Rulings:
//   [2009-10-01] If a player casts a blue spell, Kraken’s Eye’s ability triggers and is put on the
//     stack on top of that spell. Kraken’s Eye’s ability will resolve (causing you to gain 1 life)
//     before the spell does.
//   [2009-10-01] The ability triggers whenever any player, not just you, casts a blue spell.

const TEXT = "Whenever a player casts a blue spell, you may gain 1 life.";

export default defineCard({
  name: "Kraken's Eye",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "any", filter: { colors: ["U"] } },
      targets: [],
      effect: { kind: "may", prompt: "Gain 1 life?", effect: { kind: "gain-life", amount: 1 } },
      resolve: null,
      text: TEXT,
    },
  ],
});
