import { defineCard } from "../define.js";

// Rulings:
//   If the creature is an illegal target when Last Breath tries to resolve, it
//     won't resolve and none of its effects will happen. Its controller won't
//     gain 4 life.

export default defineCard({
  name: "Last Breath",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Exile target creature with power 2 or less. Its controller gains 4 life.",
  targets: [{ kind: "permanent", filter: { type: "creature", power: { op: "lte", n: 2 } } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "exile", target: 0 },
      { kind: "gain-life", amount: 4, toControllerOfTarget: 0 },
    ],
  },
});
