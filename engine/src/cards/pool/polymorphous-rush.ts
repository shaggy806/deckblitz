import { defineCard } from "../define.js";

// The creature copied isn't targeted: chosen as this resolves, and it may be one of
// the targets, which then becomes a copy of itself (the ruling). Illegal targets
// are skipped (the ruling).
export default defineCard({
  name: "Polymorphous Rush",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Strive — This spell costs {1}{U} more to cast for each target beyond the first.\nChoose a creature on the battlefield. Any number of target creatures you control each become a copy of that creature until end of turn.",
  costPerExtraTarget: "{1}{U}",
  targets: [{ kind: "any-number", of: "creature-you-control" }],
  effect: {
    kind: "choose-permanents",
    filter: { type: "creature" },
    min: 1,
    upTo: 1,
    keepTargets: true,
    then: {
      kind: "for-each-target",
      from: 1,
      effect: { kind: "become-copy", target: 1, of: 0, until: "end-of-turn" },
    },
    prompt: "Choose a creature on the battlefield.",
  },
});
