import { defineCard } from "../define.js";

// Rulings:
//   You may discard nothing: you draw nothing, but may still create a Spirit.
//   Illuminate History is still on the stack as the graveyard is counted, so
//     it doesn't count itself.
//
// Chance's "discard any number, then draw that many", then a threshold check
// read after the draw.
export default defineCard({
  name: "Illuminate History",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  subtypes: ["Lesson"],
  text: "Discard any number of cards, then draw that many cards. Then if there are seven or more cards in your graveyard, create a 3/2 red and white Spirit creature token.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "discard", target: "you", amount: 0, anyNumber: true },
      { kind: "draw", amount: { thisWay: "discarded" } },
      {
        kind: "conditional",
        condition: { kind: "cards-in-graveyard", atLeast: 7 },
        then: { kind: "create-token", token: "Spirit Token (Red-White)", count: 1 },
      },
    ],
  },
});
