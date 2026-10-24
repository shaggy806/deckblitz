import { defineCard } from "../define.js";

// EDHREC rank 10580.
//
// Planar Atlas's look, for a basic land, the rest on the bottom in any
// order. Revealing one is optional (the ruling): none chosen, nothing goes on
// top.

const LOOK_TEXT =
  "When this land enters, you may look at the top five cards of your library. If you do, reveal up to one basic land card from among them, then put that card on top of your library and the rest on the bottom in any order.";

export default defineCard({
  name: "Fertile Thicket",
  colors: [],
  types: ["land"],
  text: `This land enters tapped.\n${LOOK_TEXT}\n{T}: Add {G}.`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", tapped: true },
      text: "This land enters tapped.",
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Look at the top five cards of your library?",
        effect: {
          kind: "look-and-choose",
          zone: "library",
          count: 5,
          reveal: "chosen",
          min: 0,
          max: 1,
          filter: { type: "land", supertype: "basic" },
          destination: "library-top",
          leftover: "bottom-any-order",
        },
      },
      resolve: null,
      text: LOOK_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "G", amount: 1 },
      resolve: null,
      text: "{T}: Add {G}.",
    },
  ],
});
