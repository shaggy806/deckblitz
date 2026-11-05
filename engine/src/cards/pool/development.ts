import { defineCard } from "../define.js";

// The right half of Research // Development. Each pass asks the opponents in turn
// until one has you draw; a token only if none does (the rulings). The draw is
// the spell's controller's, done at that opponent's say.
const FACES = ["Research // Development", "Research", "Development"];

export default defineCard({
  name: "Development",
  manaCost: "{3}{U}{R}",
  colors: ["U", "R"],
  types: ["instant"],
  text: "Create a 3/1 red Elemental creature token unless any opponent has you draw a card. Repeat this process two more times.",
  targets: [],
  effect: {
    kind: "repeat",
    times: 3,
    effect: {
      kind: "unless",
      chooser: { anyOf: "each-opponent" },
      options: [{ doing: { kind: "draw", amount: 1, who: "source-controller" }, text: "Have them draw a card" }],
      otherwise: { kind: "create-token", token: "Elemental Token (Research // Development)", count: 1 },
    },
  },
  faces: FACES,
  split: true,
});
