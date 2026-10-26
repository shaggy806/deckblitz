import { defineCard } from "../define.js";

export default defineCard({
  name: "Boiling Blood",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Target creature attacks this turn if able.\nDraw a card.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "restrict", target: 0, restrictions: ["must-attack"] },
      { kind: "draw", amount: 1 },
    ],
  },
});
