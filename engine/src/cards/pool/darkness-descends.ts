import { defineCard } from "../define.js";

// EDHREC rank 10136.

export default defineCard({
  name: "Darkness Descends",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Put two -1/-1 counters on each creature.",
  targets: [],
  effect: { kind: "add-counter-all", filter: { type: "creature" }, counter: "-1/-1", amount: 2 },
});
