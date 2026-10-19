import { defineCard } from "../define.js";

// EDHREC rank 14156.
//
// Rulings:
//   [2022-10-07] In Two-Headed giant and other formats where multiple players can attack at the
//     same time, Epistolary Librarian's triggered ability counts all attacking creatures, even
//     those controlled by other players.
//
// X is every attacking creature, whoever controls it, read as the ability
// resolves (Electrodominance's free cast, Kinscaer Sentry's count).

const VEIL_TEXT =
  "Veil of Time — Whenever this creature attacks, you may cast a spell with mana value X or less from your hand without paying its mana cost, where X is the number of attacking creatures.";

export default defineCard({
  name: "Epistolary Librarian",
  manaCost: "{2}{W}{U}",
  colors: ["W", "U"],
  types: ["creature"],
  subtypes: ["Astartes", "Wizard"],
  power: 3,
  toughness: 4,
  text: VEIL_TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "cast-now",
        from: "hand",
        free: true,
        spell: { manaValue: { op: "lte", n: { amount: { countOf: { type: "creature", attacking: true } } } } },
      },
      resolve: null,
      text: VEIL_TEXT,
    },
  ],
});
