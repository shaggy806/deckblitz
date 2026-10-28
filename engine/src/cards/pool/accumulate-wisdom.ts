import { defineCard } from "../define.js";

// EDHREC rank 5580. The Lesson count is read as it resolves (the spell itself
// is on the stack, not in the graveyard).

export default defineCard({
  name: "Accumulate Wisdom",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  subtypes: ["Lesson"],
  text: "Look at the top three cards of your library. Put one of those cards into your hand and the rest on the bottom of your library in any order. Put each of those cards into your hand instead if there are three or more Lesson cards in your graveyard.",
  targets: [],
  effect: {
    kind: "conditional",
    condition: { kind: "cards-in-graveyard", atLeast: 3, filter: { subtype: "Lesson" } },
    then: { kind: "look-and-choose", zone: "library", count: 3, min: 3, max: 3, destination: "hand", leftover: "bottom-any-order" },
    else: { kind: "look-and-choose", zone: "library", count: 3, min: 1, max: 1, destination: "hand", leftover: "bottom-any-order" },
  },
});
