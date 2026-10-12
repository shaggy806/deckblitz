import { defineCard } from "../define.js";

export default defineCard({
  name: "Launch Party",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["instant"],
  additionalCost: { sacrifice: { type: "creature", controlledBy: "you" } },
  text: "As an additional cost to cast this spell, sacrifice a creature.\nDestroy target creature. Its controller loses 2 life.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [{ kind: "destroy", target: 0 }, { kind: "lose-life", amount: 2, toControllerOfTarget: 0 }],
  },
});
