import { defineCard } from "../define.js";

// Adventures in the Forgotten Realms. Each opponent exiles, one card at a
// time, until the cards they've exiled add up to mana value 20 (rule 202.3) —
// all of their library if it doesn't.
export default defineCard({
  name: "Tasha's Hideous Laughter",
  manaCost: "{1}{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Each opponent exiles cards from the top of their library until that player has exiled cards with total mana value 20 or greater.",
  effect: {
    kind: "for-each-player",
    who: "each-opponent",
    effect: {
      kind: "reveal-until-count",
      whose: "that-player",
      filter: {},
      count: 20,
      measure: "mana-value",
      exile: true,
      put: "with-rest",
      rest: "stay",
    },
  },
});
