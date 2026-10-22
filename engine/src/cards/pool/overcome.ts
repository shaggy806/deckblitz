import { defineCard } from "../define.js";

// EDHREC rank 12482.
//
// Rulings:
//   [2017-07-14] Overcome affects only creatures you control at the time it resolves.

export default defineCard({
  name: "Overcome",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Creatures you control get +2/+2 and gain trample until end of turn. (Each of those creatures can deal excess combat damage to the player or planeswalker it's attacking.)",
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "modify-pt-all",
        filter: { type: "creature", controlledBy: "you" },
        power: 2,
        toughness: 2,
        duration: "end-of-turn",
      },
      {
        kind: "grant-keyword-all",
        filter: { type: "creature", controlledBy: "you" },
        keyword: "trample",
        duration: "end-of-turn",
      },
    ],
  },
});
