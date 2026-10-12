import { defineCard } from "../define.js";

export default defineCard({
  name: "Spreading Rot",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Destroy target land. Its controller loses 2 life.",
  targets: ["land"],
  effect: {
    kind: "sequence",
    effects: [{ kind: "destroy", target: 0 }, { kind: "lose-life", amount: 2, toControllerOfTarget: 0 }],
  },
});
