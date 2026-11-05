import { defineCard } from "../define.js";


export default defineCard({
  name: "Dismal Failure",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Counter target spell. Its controller discards a card.",
  targets: ["spell"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "counter", target: 0 },
      { kind: "discard", target: { controllerOfTarget: 0 }, amount: 1 },
    ],
  },
});
