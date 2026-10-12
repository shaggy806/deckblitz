import { defineCard } from "../define.js";

export default defineCard({
  name: "Glissa's Scorn",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Destroy target artifact. Its controller loses 1 life.",
  targets: ["artifact"],
  effect: {
    kind: "sequence",
    effects: [{ kind: "destroy", target: 0 }, { kind: "lose-life", amount: 1, toControllerOfTarget: 0 }],
  },
});
