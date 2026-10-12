import { defineCard } from "../define.js";

export default defineCard({
  name: "Death Bomb",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["instant"],
  additionalCost: { sacrifice: { type: "creature", controlledBy: "you" } },
  text: "As an additional cost to cast this spell, sacrifice a creature.\nDestroy target nonblack creature. It can't be regenerated. Its controller loses 2 life.",
  targets: ["nonblack-creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy", target: 0, cantBeRegenerated: true },
      { kind: "lose-life", amount: 2, toControllerOfTarget: 0 },
    ],
  },
});
