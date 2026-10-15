import { defineCard } from "../define.js";

// EDHREC rank 13094.
// Rulings:
//   [2025-06-06] You must still follow any timing restrictions and permissions, including those
//     based on the card's type. For instance, you can cast a sorcery using flashback only when you
//     could normally cast a sorcery.
//   [2025-06-06] A spell cast using flashback will always be exiled afterward, whether it
//     resolves, is countered, or leaves the stack in some other way.

export default defineCard({
  name: "Call the Mountain Chocobo",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["sorcery"],
  flashback: { cost: "{5}{R}" },
  text: 'Search your library for a Mountain card, reveal it, put it into your hand, then shuffle. Create a 2/2 green Bird creature token with "Whenever a land you control enters, this token gets +1/+0 until end of turn."\nFlashback {5}{R} (You may cast this card from your graveyard for its flashback cost. Then exile it.)',
  // "A Mountain card" is any card with the Mountain land type, basic or not.
  effect: {
    kind: "sequence",
    effects: [
      { kind: "search-library", filter: { subtype: "Mountain" }, destination: "hand", min: 0, max: 1, reveal: true },
      { kind: "create-token", token: "Chocobo Bird Token", count: 1 },
    ],
  },
});
