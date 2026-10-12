import { defineCard } from "../define.js";

export default defineCard({
  name: "Sip of Hemlock",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Destroy target creature. Its controller loses 2 life.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [{ kind: "destroy", target: 0 }, { kind: "lose-life", amount: 2, toControllerOfTarget: 0 }],
  },
});
