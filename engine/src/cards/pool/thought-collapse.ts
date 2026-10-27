import { defineCard } from "../define.js";

export default defineCard({
  name: "Thought Collapse",
  manaCost: "{1}{U}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Counter target spell. Its controller mills three cards.",
  targets: ["spell"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "counter", target: 0 },
      { kind: "mill", target: 0, amount: 3 },
    ],
  },
});
