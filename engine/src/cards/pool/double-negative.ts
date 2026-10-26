import { defineCard } from "../define.js";

// "Up to two target spells": none, one or two different spells (the ruling).
export default defineCard({
  name: "Double Negative",
  manaCost: "{U}{U}{R}",
  colors: ["U", "R"],
  types: ["instant"],
  text: "Counter up to two target spells.",
  targets: [{ kind: "any-number", of: "spell", max: 2 }],
  effect: { kind: "for-each-target", from: 0, effect: { kind: "counter", target: 0 }, simultaneous: true },
});
