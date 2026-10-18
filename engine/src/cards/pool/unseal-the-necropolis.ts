import { defineCard } from "../define.js";

// EDHREC rank 8964.
//
// "Return up to two creature cards" chooses as it resolves (no targets), so a
// card just milled can be taken.

export default defineCard({
  name: "Unseal the Necropolis",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Each player mills three cards. Then you return up to two creature cards from your graveyard to your hand. (To mill three cards, a player puts the top three cards of their library into their graveyard.)",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "mill", target: "each-player", amount: 3 },
      {
        kind: "look-and-choose",
        zone: "graveyard",
        min: 0,
        max: 2,
        destination: "hand",
        leftover: "stay",
        filter: { type: "creature" },
      },
    ],
  },
});
