import { defineCard } from "../define.js";

export default defineCard({
  name: "Hideous End",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Destroy target nonblack creature. Its controller loses 2 life.",
  targets: ["nonblack-creature"],
  effect: {
    kind: "sequence",
    effects: [{ kind: "destroy", target: 0 }, { kind: "lose-life", amount: 2, toControllerOfTarget: 0 }],
  },
});
