import { defineCard } from "../define.js";

export default defineCard({
  name: "Colossal Heroics",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["instant"],
  text:
    "Strive — This spell costs {1}{G} more to cast for each target beyond the first.\n" +
    "Any number of target creatures each get +2/+2 until end of turn. Untap those creatures.",
  costPerExtraTarget: "{1}{G}",
  targets: [{ kind: "any-number", of: "creature" }],
  effect: {
    kind: "for-each-target",
    from: 0,
    effect: {
      kind: "sequence",
      effects: [
        { kind: "modify-pt", target: 0, power: 2, toughness: 2, duration: "end-of-turn" },
        { kind: "untap", target: 0 },
      ],
    },
  },
});
