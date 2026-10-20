import { defineCard } from "../define.js";

// EDHREC rank 17127.

export default defineCard({
  name: "Fierce Retribution",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Cleave {5}{W} (You may cast this spell for its cleave cost. If you do, remove the words in square brackets.)\nDestroy target [attacking] creature.",
  targets: [{ kind: "permanent", filter: { type: "creature", attacking: true } }],
  effect: { kind: "destroy", target: 0 },
  cleave: {
    cost: "{5}{W}",
    targets: ["creature"],
    effect: { kind: "destroy", target: 0 },
  },
});
