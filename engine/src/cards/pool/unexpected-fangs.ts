import { defineCard } from "../define.js";

// EDHREC rank 9022. Ikoria: Lair of Behemoths.

export default defineCard({
  name: "Unexpected Fangs",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Put a +1/+1 counter and a lifelink counter on target creature.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      { kind: "add-counter", target: 0, counter: "lifelink", amount: 1 },
    ],
  },
});
