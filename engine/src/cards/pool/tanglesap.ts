import { defineCard } from "../define.js";

// Zendikar (ZEN). EDHREC rank 21735. Vine Snare's shape: each source is asked
// whether it has trample as its combat damage would be dealt (the ruling).

export default defineCard({
  name: "Tanglesap",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Prevent all combat damage that would be dealt this turn by creatures without trample.",
  targets: [],
  effect: { kind: "prevent-all-combat-damage", by: { type: "creature", notKeyword: "trample" } },
});
