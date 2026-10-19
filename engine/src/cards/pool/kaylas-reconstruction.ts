import { defineCard } from "../define.js";

// EDHREC rank 18517. The Brothers' War.
// Rulings:
//   Each of the cards needs to have mana value 3 or less. It's not the total mana value of the
//   cards.

export default defineCard({
  name: "Kayla's Reconstruction",
  manaCost: "{X}{W}{W}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Look at the top seven cards of your library. Put up to X artifact and/or creature cards with mana value 3 or less from among them onto the battlefield. Put the rest on the bottom of your library in a random order.",
  targets: [],
  // United Battlefront's shape, with X for the count.
  effect: {
    kind: "look-and-choose",
    zone: "library",
    count: 7,
    min: 0,
    max: "x",
    filter: { typesAnyOf: ["artifact", "creature"], manaValue: { op: "lte", n: 3 } },
    destination: "battlefield",
    leftover: "bottom-random",
  },
});
