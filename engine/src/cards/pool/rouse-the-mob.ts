import { defineCard } from "../define.js";

export default defineCard({
  name: "Rouse the Mob",
  manaCost: "{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Strive — This spell costs {2}{R} more to cast for each target beyond the first.\nAny number of target creatures each get +2/+0 and gain trample until end of turn.",
  costPerExtraTarget: "{2}{R}",
  targets: [{ kind: "any-number", of: "creature" }],
  effect: {
    kind: "for-each-target",
    from: 0,
    effect: {
      kind: "sequence",
      effects: [
        { kind: "modify-pt", target: 0, power: 2, toughness: 0, duration: "end-of-turn" },
        { kind: "grant-keyword", target: 0, keyword: "trample", duration: "end-of-turn" },
      ],
    },
  },
});
