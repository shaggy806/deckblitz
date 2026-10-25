import { defineCard } from "../define.js";

export default defineCard({
  name: "Desperate Stand",
  manaCost: "{R}{W}",
  colors: ["W", "R"],
  types: ["sorcery"],
  text: "Strive — This spell costs {R}{W} more to cast for each target beyond the first.\nAny number of target creatures each get +2/+0 and gain first strike and vigilance until end of turn.",
  costPerExtraTarget: "{R}{W}",
  targets: [{ kind: "any-number", of: "creature" }],
  effect: {
    kind: "for-each-target",
    from: 0,
    effect: {
      kind: "sequence",
      effects: [
        { kind: "modify-pt", target: 0, power: 2, toughness: 0, duration: "end-of-turn" },
        { kind: "grant-keyword", target: 0, keyword: "first-strike", duration: "end-of-turn" },
        { kind: "grant-keyword", target: 0, keyword: "vigilance", duration: "end-of-turn" },
      ],
    },
  },
});
