import { defineCard } from "../define.js";

// EDHREC rank 9280.
//
// Rulings:
//   [2026-03-20] Putting a land card onto the battlefield with Embrace the Paradox doesn't count
//     as playing a land. You can put a land card onto the battlefield this way even if you've
//     already played a land for the turn.

export default defineCard({
  name: "Embrace the Paradox",
  manaCost: "{3}{G}{U}",
  colors: ["U", "G"],
  types: ["instant"],
  text: "Draw three cards. You may put a land card from your hand onto the battlefield tapped.",
  // Lessons from Life's shape: the land isn't played (the ruling).
  effect: {
    kind: "sequence",
    effects: [
      { kind: "draw", amount: 3 },
      {
        kind: "look-and-choose",
        zone: "hand",
        min: 0,
        max: 1,
        destination: "battlefield",
        enterTapped: true,
        leftover: "stay",
        filter: { type: "land" },
      },
    ],
  },
});
