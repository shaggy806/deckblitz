import { defineCard } from "../define.js";

// EDHREC rank 28133.

export default defineCard({
  name: "Enduring Victory",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Destroy target attacking or blocking creature. Bolster 1. (Choose a creature with the least toughness among creatures you control and put a +1/+1 counter on it.)",
  targets: ["attacking-or-blocking-creature"],
  effect: {
    kind: "sequence",
    effects: [{ kind: "destroy", target: 0 }, { kind: "bolster", amount: 1 }],
  },
});
