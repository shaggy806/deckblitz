import { defineCard } from "../define.js";

// EDHREC rank 27120.
//
// The prohibition is on playing lands (rule 305.2), from any zone and under
// any permission; an effect that puts a land onto the battlefield isn't a
// land play and still works. Cast on the player's own turn after their land
// play, it changes nothing that turn.
export default defineCard({
  name: "Turf Wound",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Target player can't play lands this turn.\nDraw a card.",
  targets: ["player"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "prohibit", who: 0, lands: true },
      { kind: "draw", amount: 1 },
    ],
  },
});
