import { defineCard } from "../define.js";

export default defineCard({
  name: "Ajani's Presence",
  manaCost: "{W}",
  colors: ["W"],
  types: ["instant"],
  text:
    "Strive — This spell costs {2}{W} more to cast for each target beyond the first.\n" +
    "Any number of target creatures each get +1/+1 and gain indestructible until end of turn. (Damage and effects that say \"destroy\" don't destroy them.)",
  costPerExtraTarget: "{2}{W}",
  targets: [{ kind: "any-number", of: "creature" }],
  effect: {
    kind: "for-each-target",
    from: 0,
    effect: {
      kind: "sequence",
      effects: [
        { kind: "modify-pt", target: 0, power: 1, toughness: 1, duration: "end-of-turn" },
        { kind: "grant-keyword", target: 0, keyword: "indestructible", duration: "end-of-turn" },
      ],
    },
  },
});
