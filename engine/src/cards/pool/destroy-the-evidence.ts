import { defineCard } from "../define.js";

// EDHREC rank 19697.
//
// Rulings:
//   [2012-10-01] If the controller of the target land has no land cards in their library, all
//     cards from that library will be revealed and put into their graveyard.
//
// Balustrade Spy's `reveal-until`, read from the destroyed land's controller.

export default defineCard({
  name: "Destroy the Evidence",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Destroy target land. Its controller reveals cards from the top of their library until they reveal a land card, then puts those cards into their graveyard.",
  targets: ["land"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy", target: 0 },
      { kind: "reveal-until", whose: { controllerOfTarget: 0 }, filter: { type: "land" }, rest: "graveyard" },
    ],
  },
});
