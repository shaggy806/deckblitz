import { defineCard } from "../define.js";

// EDHREC rank 14401.

export default defineCard({
  name: "Soul's Might",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Put X +1/+1 counters on target creature, where X is that creature's power.",
  targets: ["creature"],
  effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: { powerOf: 0 } },
});
