import { defineCard } from "../define.js";

export default defineCard({
  name: "Aerial Formation",
  manaCost: "{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Strive — This spell costs {2}{U} more to cast for each target beyond the first.\nAny number of target creatures each get +1/+1 and gain flying until end of turn.",
  costPerExtraTarget: "{2}{U}",
  targets: [{ kind: "any-number", of: "creature" }],
  effect: {
    kind: "for-each-target",
    from: 0,
    effect: {
      kind: "sequence",
      effects: [
        { kind: "modify-pt", target: 0, power: 1, toughness: 1, duration: "end-of-turn" },
        { kind: "grant-keyword", target: 0, keyword: "flying", duration: "end-of-turn" },
      ],
    },
  },
});
