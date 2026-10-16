import { defineCard } from "../define.js";

// EDHREC rank 8432.
//
// Rulings:
//   [2023-11-10] Abilities that begin with "At the beginning of your end step, if you descended
//     this turn" will trigger only once during your end step, no matter how many times you
//     descended this turn. However, if you haven't descended this turn as your end step begins,
//     the ability won't trigger at all.
//   [2023-11-10] A permanent card is an artifact, battle, creature, enchantment, land, or
//     planeswalker card. Tokens are not cards, and while tokens are put into the graveyard before
//     ceasing to exist, that action doesn't count as a player having descended.
//
// Enterprising Scallywag's intervening-if.
const END_TEXT =
  "At the beginning of your end step, if you descended this turn, scry 1. (You descended if a permanent card was put into your graveyard from anywhere.)";

export default defineCard({
  name: "Ruin-Lurker Bat",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Bat"],
  power: 1,
  toughness: 1,
  keywords: ["flying", "lifelink"],
  text: `Flying, lifelink\n${END_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      condition: { kind: "turn-history", what: "descended" },
      targets: [],
      effect: { kind: "scry", amount: 1 },
      resolve: null,
      text: END_TEXT,
    },
  ],
});
