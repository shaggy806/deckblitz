import { defineCard } from "../define.js";

export default defineCard({
  name: "Annihilate",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Destroy target nonblack creature. It can't be regenerated.\nDraw a card.",
  targets: ["nonblack-creature"],
  effect: {
    kind: "sequence",
    effects: [{ kind: "destroy", target: 0, cantBeRegenerated: true }, { kind: "draw", amount: 1 }],
  },
});
