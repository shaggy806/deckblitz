import { defineCard } from "../define.js";

export default defineCard({
  name: "Kiss of the Amesha",
  manaCost: "{4}{W}{U}",
  colors: ["W", "U"],
  types: ["sorcery"],
  text: "Target player gains 7 life and draws two cards.",
  targets: ["player"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "gain-life", amount: 7, toControllerOfTarget: 0 },
      { kind: "draw", amount: 2, target: 0 },
    ],
  },
});
