import { defineCard } from "../define.js";

export default defineCard({
  name: "Vanquish the Foul",
  manaCost: "{5}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Destroy target creature with power 4 or greater. Scry 1. (Look at the top card of your library. You may put that card on the bottom.)",
  targets: [{ kind: "permanent", filter: { type: "creature", power: { op: "gte", n: 4 } } }],
  effect: { kind: "sequence", effects: [{ kind: "destroy", target: 0 }, { kind: "scry", amount: 1 }] },
});
