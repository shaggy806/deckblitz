import { defineCard } from "../define.js";

// Rulings: X is 0 and additional costs may be paid (a free cast-now); a card
// that isn't an instant or sorcery stays on top, unrevealed.

const TEXT =
  "At the beginning of your upkeep, you may look at the top card of your library. You may cast it without paying its mana cost if it's an instant or sorcery spell.";

export default defineCard({
  name: "Galvanoth",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 3,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 1,
        min: 0,
        max: 1,
        filter: { typesAnyOf: ["instant", "sorcery"] },
        destination: "library-top",
        leftover: "stay",
        then: { kind: "cast-now", target: 0, free: true },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
