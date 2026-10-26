import { defineCard } from "../define.js";

// EDHREC rank 22419.
//
// Rulings:
//   You choose the order of the cards you put on top of your library.
//   Cast with zero targets, you still draw; cast with targets that all
//     become illegal, it doesn't resolve and you don't draw (Footbottom
//     Feast's shape).

export default defineCard({
  name: "Frantic Salvage",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Put any number of target artifact cards from your graveyard on top of your library.\nDraw a card.",
  targets: [{ kind: "any-number", of: { kind: "card-in-graveyard", whose: "you", filter: { type: "artifact" } } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "for-each-target", from: 0, effect: { kind: "put-on-library", target: 0, position: "top" } },
      { kind: "draw", amount: 1 },
    ],
  },
});
