import { defineCard } from "../define.js";

// EDHREC rank 12590. Each creature card's own mana value is 3 or less, not
// their total (the ruling).
export default defineCard({
  name: "Collected Company",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Look at the top six cards of your library. Put up to two creature cards with mana value 3 or less from among them onto the battlefield. Put the rest on the bottom of your library in any order.",
  targets: [],
  effect: {
    kind: "look-and-choose",
    zone: "library",
    count: 6,
    min: 0,
    max: 2,
    filter: { type: "creature", manaValue: { op: "lte", n: 3 } },
    destination: "battlefield",
    leftover: "bottom-any-order",
  },
});
