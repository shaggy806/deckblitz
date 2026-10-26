import { defineCard } from "../define.js";

// Rulings:
//   [2004-10-04] Must target two different enchantments.

export default defineCard({
  name: "Peace and Quiet",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Destroy two target enchantments.",
  targets: [{ kind: "any-number", of: "enchantment", min: 2, max: 2 }],
  effect: { kind: "for-each-target", from: 0, effect: { kind: "destroy", target: 0 }, simultaneous: true },
});
