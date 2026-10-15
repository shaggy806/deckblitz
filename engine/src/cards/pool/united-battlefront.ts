import { defineCard } from "../define.js";

// EDHREC rank 14219.
//
// Rulings:
//   [2025-04-04] If a card in a library has {X} in its mana cost, X is 0 for the purpose of
//     determining its mana value.
//
// A noncreature, nonland permanent card is an artifact, battle, enchantment or
// planeswalker card that isn't also a creature or a land (an artifact
// creature isn't one).

export default defineCard({
  name: "United Battlefront",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Look at the top seven cards of your library. Put up to two noncreature, nonland permanent cards with mana value 3 or less from among them onto the battlefield. Put the rest on the bottom of your library in a random order.",
  effect: {
    kind: "look-and-choose",
    zone: "library",
    count: 7,
    min: 0,
    max: 2,
    filter: {
      typesAnyOf: ["artifact", "battle", "enchantment", "planeswalker"],
      notTypes: ["creature", "land"],
      manaValue: { op: "lte", n: 3 },
    },
    destination: "battlefield",
    leftover: "bottom-random",
  },
});
