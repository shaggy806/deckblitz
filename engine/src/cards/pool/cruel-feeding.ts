import { defineCard } from "../define.js";

export default defineCard({
  name: "Cruel Feeding",
  manaCost: "{B}",
  colors: ["B"],
  types: ["instant"],
  text:
    "Strive — This spell costs {2}{B} more to cast for each target beyond the first.\n" +
    "Any number of target creatures each get +1/+0 and gain lifelink until end of turn. (Damage dealt by a creature with lifelink also causes its controller to gain that much life.)",
  costPerExtraTarget: "{2}{B}",
  targets: [{ kind: "any-number", of: "creature" }],
  effect: {
    kind: "for-each-target",
    from: 0,
    effect: {
      kind: "sequence",
      effects: [
        { kind: "modify-pt", target: 0, power: 1, toughness: 0, duration: "end-of-turn" },
        { kind: "grant-keyword", target: 0, keyword: "lifelink", duration: "end-of-turn" },
      ],
    },
  },
});
