import { defineCard } from "../define.js";

// EDHREC rank 20979. X is read once, as it resolves (rule 608.2h — the ruling:
// the toughness change is no longer continuous).

export default defineCard({
  name: "Blood Lust",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "If target creature has toughness 5 or greater, it gets +4/-4 until end of turn. Otherwise, it gets +4/-X until end of turn, where X is its toughness minus 1.",
  targets: ["creature"],
  effect: {
    kind: "conditional",
    condition: { kind: "target", index: 0, filter: { toughness: { op: "gte", n: 5 } } },
    then: { kind: "modify-pt", target: 0, power: 4, toughness: -4, duration: "end-of-turn" },
    else: {
      kind: "modify-pt",
      target: 0,
      power: 4,
      toughness: { product: [{ difference: [{ toughnessOf: 0 }, 1] }, -1] },
      duration: "end-of-turn",
    },
  },
});
