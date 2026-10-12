import { defineCard } from "../define.js";

export default defineCard({
  name: "Shake the Foundations",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Shake the Foundations deals 1 damage to each creature without flying.\nDraw a card.",
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage-all", filter: { type: "creature", notKeyword: "flying" }, amount: 1 },
      { kind: "draw", amount: 1 },
    ],
  },
});
