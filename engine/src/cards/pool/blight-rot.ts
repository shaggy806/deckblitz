import { defineCard } from "../define.js";

// EDHREC rank 8970.

export default defineCard({
  name: "Blight Rot",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Put four -1/-1 counters on target creature.",
  targets: ["creature"],
  effect: { kind: "add-counter", target: 0, counter: "-1/-1", amount: 4 },
});
