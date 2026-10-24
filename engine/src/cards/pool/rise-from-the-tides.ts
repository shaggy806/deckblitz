import { defineCard } from "../define.js";

// EDHREC rank 7713.
//
// Rulings:
//   Rise from the Tides is still on the stack while you count the number of instant and sorcery
//     cards in your graveyard. It doesn't count itself.

export default defineCard({
  name: "Rise from the Tides",
  manaCost: "{5}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Create a tapped 2/2 black Zombie creature token for each instant and sorcery card in your graveyard.",
  targets: [],
  effect: {
    kind: "create-token",
    token: "Zombie Token",
    count: { countInGraveyard: { typesAnyOf: ["instant", "sorcery"], ownedBy: "you" } },
    tapped: true,
  },
});
