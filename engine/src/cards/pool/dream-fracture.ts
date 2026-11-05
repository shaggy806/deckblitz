import { defineCard } from "../define.js";


export default defineCard({
  name: "Dream Fracture",
  manaCost: "{1}{U}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Counter target spell. Its controller draws a card.\nDraw a card.",
  targets: ["spell"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "counter", target: 0 },
      { kind: "draw", who: { controllerOfTarget: 0 }, amount: 1 },
      { kind: "draw", amount: 1 },
    ],
  },
});
