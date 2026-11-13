import { defineCard } from "../define.js";

// EDHREC rank 4168. Both halves read the X chosen as it was cast, not the mana
// spent or the damage dealt (its rulings): `cantBeCountered` through the
// spell's `xValue` as something would counter it, the damage through the
// resolving spell's X. A counterspell still resolves, its counter doing
// nothing (rule 701.6b).
export default defineCard({
  name: "Banefire",
  manaCost: "{X}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Banefire deals X damage to any target.\nIf X is 5 or more, this spell can't be countered and the damage can't be prevented.",
  targets: ["any-target"],
  cantBeCountered: { kind: "source", filter: { xValue: { op: "gte", n: 5 } } },
  effect: {
    kind: "conditional",
    condition: { kind: "x", compare: { op: "gte", n: 5 } },
    then: { kind: "damage", amount: "x", target: 0, cantBePrevented: true },
    else: { kind: "damage", amount: "x", target: 0 },
  },
});
