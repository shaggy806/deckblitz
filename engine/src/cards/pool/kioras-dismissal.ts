import { defineCard } from "../define.js";

export default defineCard({
  name: "Kiora's Dismissal",
  manaCost: "{U}",
  colors: ["U"],
  types: ["instant"],
  text:
    "Strive — This spell costs {U} more to cast for each target beyond the first.\n" +
    "Return any number of target enchantments to their owners' hands.",
  costPerExtraTarget: "{U}",
  targets: [{ kind: "any-number", of: "enchantment" }],
  effect: {
    kind: "for-each-target",
    from: 0,
    effect: { kind: "return-to-hand", target: 0 },
    simultaneous: true,
  },
});
