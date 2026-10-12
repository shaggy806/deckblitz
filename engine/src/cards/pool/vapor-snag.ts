import { defineCard } from "../define.js";

export default defineCard({
  name: "Vapor Snag",
  manaCost: "{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Return target creature to its owner's hand. Its controller loses 1 life.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "return-to-hand", target: 0 },
      { kind: "lose-life", amount: 1, toControllerOfTarget: 0 },
    ],
  },
});
