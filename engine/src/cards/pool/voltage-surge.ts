import { defineCard } from "../define.js";

// EDHREC rank 20168. An optional additional cost that isn't kicker (rule
// 118.8): `kicker` with `keyword: "additional cost"`, so nothing else sees a
// kicked spell, and its non-mana cost as `also.sacrifice`, the artifact chosen
// as the cost is paid once the spell is on the stack (601.2h). "If this
// spell's additional cost was paid" is the kicker's `effect`.

export default defineCard({
  name: "Voltage Surge",
  manaCost: "{R}",
  colors: ["R"],
  types: ["instant"],
  text: "As an additional cost to cast this spell, you may sacrifice an artifact.\nVoltage Surge deals 2 damage to target creature or planeswalker. If this spell's additional cost was paid, Voltage Surge deals 4 damage instead.",
  targets: [{ kind: "permanent", whose: "any", filter: { typesAnyOf: ["creature", "planeswalker"] } }],
  effect: { kind: "damage", amount: 2, target: 0 },
  kicker: {
    cost: "",
    keyword: "additional cost",
    also: { text: "Sacrifice an artifact", sacrifice: { filter: { type: "artifact" }, count: 1 } },
    effect: { kind: "damage", amount: 4, target: 0 },
  },
});
