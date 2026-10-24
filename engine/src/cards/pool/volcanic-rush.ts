import { defineCard } from "../define.js";

// EDHREC rank 24378.
//
// Rulings:
//   [2015-02-25] Only creatures that are attacking as Volcanic Rush resolves will receive the
//     bonus. Even though it affects only attacking creatures, the bonus will remain for the rest
//     of the turn.

export default defineCard({
  name: "Volcanic Rush",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Attacking creatures get +2/+0 and gain trample until end of turn.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt-all", filter: { type: "creature", attacking: true }, power: 2, toughness: 0, duration: "end-of-turn" },
      { kind: "grant-keyword-all", filter: { type: "creature", attacking: true }, keyword: "trample", duration: "end-of-turn" },
    ],
  },
});
