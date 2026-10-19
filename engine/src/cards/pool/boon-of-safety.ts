import { defineCard } from "../define.js";

// EDHREC rank 7007.

export default defineCard({
  name: "Boon of Safety",
  manaCost: "{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Put a shield counter on target creature. (If it would be dealt damage or destroyed, remove a shield counter from it instead.)\nScry 1.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "add-counter", target: 0, counter: "shield", amount: 1 },
      { kind: "scry", amount: 1 },
    ],
  },
});
