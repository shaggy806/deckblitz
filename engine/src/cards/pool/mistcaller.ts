import { defineCard } from "../define.js";

// Magic 2019 (M19). EDHREC rank 15508.
//
// A resolved replacement for the turn (rules 611.2c, 614.6): Containment
// Priest's words as a `replacement-effect`, judged as each creature would
// exist on the battlefield (614.12) — a creature cast and resolving enters,
// from any zone; one put there any other way is exiled. Tokens, creatures
// already there, and anything entering beside Mistcaller aren't touched (the
// rulings).
const TEXT = "Sacrifice this creature: Until end of turn, if a nontoken creature would enter and it wasn't cast, exile it instead.";

export default defineCard({
  name: "Mistcaller",
  manaCost: "{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Merfolk", "Wizard"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: "self" },
      targets: [],
      effect: {
        kind: "replacement-effect",
        duration: "end-of-turn",
        replacement: {
          event: "others-enter-battlefield",
          filter: { type: "creature", token: false, cast: false },
          exileInstead: true,
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
