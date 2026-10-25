import { defineCard } from "../define.js";

export default defineCard({
  name: "Phalanx Formation",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Strive — This spell costs {1}{W} more to cast for each target beyond the first.\nAny number of target creatures each gain double strike until end of turn. (They deal both first-strike and regular combat damage.)",
  costPerExtraTarget: "{1}{W}",
  targets: [{ kind: "any-number", of: "creature" }],
  effect: {
    kind: "for-each-target",
    from: 0,
    effect: { kind: "grant-keyword", target: 0, keyword: "double-strike", duration: "end-of-turn" },
  },
});
