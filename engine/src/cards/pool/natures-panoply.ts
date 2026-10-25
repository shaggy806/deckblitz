import { defineCard } from "../define.js";

export default defineCard({
  name: "Nature's Panoply",
  manaCost: "{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Strive — This spell costs {2}{G} more to cast for each target beyond the first.\nChoose any number of target creatures. Put a +1/+1 counter on each of them.",
  costPerExtraTarget: "{2}{G}",
  targets: [{ kind: "any-number", of: "creature" }],
  effect: {
    kind: "for-each-target",
    from: 0,
    effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
  },
});
