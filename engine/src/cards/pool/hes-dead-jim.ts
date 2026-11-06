import { defineCard } from "../define.js";

// EDHREC rank 31680.

export default defineCard({
  name: "He's Dead, Jim",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Destroy target creature. Surveil 1. (Look at the top card of your library. You may put it into your graveyard.)",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [{ kind: "destroy", target: 0 }, { kind: "surveil", amount: 1 }],
  },
});
