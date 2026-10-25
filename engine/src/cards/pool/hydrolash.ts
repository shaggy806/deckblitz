import { defineCard } from "../define.js";

// Magic Origins. EDHREC rank 27899.
//
// Rulings:
//   [2015-06-22] You may cast Hydrolash even if there aren't any attacking creatures simply to
//     draw a card.
//
// The creatures attacking as it resolves (rule 611.2c), every player's.
export default defineCard({
  name: "Hydrolash",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Attacking creatures get -2/-0 until end of turn.\nDraw a card.",
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "modify-pt-all",
        filter: { type: "creature", attacking: true },
        power: -2,
        toughness: 0,
        duration: "end-of-turn",
      },
      { kind: "draw", amount: 1 },
    ],
  },
});
