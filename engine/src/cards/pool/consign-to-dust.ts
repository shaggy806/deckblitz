import { defineCard } from "../define.js";

export default defineCard({
  name: "Consign to Dust",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["instant"],
  text:
    "Strive — This spell costs {2}{G} more to cast for each target beyond the first.\n" +
    "Destroy any number of target artifacts and/or enchantments.",
  costPerExtraTarget: "{2}{G}",
  targets: [{ kind: "any-number", of: "artifact-or-enchantment" }],
  effect: { kind: "for-each-target", from: 0, simultaneous: true, effect: { kind: "destroy", target: 0 } },
});
