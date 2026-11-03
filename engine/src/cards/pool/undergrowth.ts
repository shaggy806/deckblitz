import { defineCard } from "../define.js";

// An optional additional cost that isn't kicker (rule 118.8): `kicker` with
// `keyword: "additional cost"`, so nothing else sees a kicked spell. Only
// creatures deal combat damage, so "not by red creatures" is "by what isn't
// red", read as the damage is dealt.

export default defineCard({
  name: "Undergrowth",
  manaCost: "{G}",
  colors: ["G"],
  types: ["instant"],
  text: "As an additional cost to cast this spell, you may pay {2}{R}.\nPrevent all combat damage that would be dealt this turn. If this spell's additional cost was paid, this effect doesn't affect combat damage that would be dealt by red creatures.",
  kicker: {
    cost: "{2}{R}",
    keyword: "additional cost",
    effect: { kind: "prevent-all-combat-damage", by: { notColors: ["R"] } },
  },
  effect: { kind: "prevent-all-combat-damage" },
});
