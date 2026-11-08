import { defineCard } from "../define.js";

/** Each half is a `conditional` on the mana spent, read as it resolves (its
 * rulings); a copy never had either colour spent. */
export default defineCard({
  name: "Moonhold",
  manaCost: "{2}{R/W}",
  colors: ["R", "W"],
  types: ["instant"],
  text: "Target player can't play lands this turn if {R} was spent to cast this spell and can't cast creature spells this turn if {W} was spent to cast this spell. (Do both if {R}{W} was spent.)",
  targets: ["player"],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "conditional",
        condition: { kind: "source", filter: { manaSpent: [{ type: "R", amount: { op: "gte", n: 1 } }] } },
        then: { kind: "prohibit", who: 0, lands: true },
      },
      {
        kind: "conditional",
        condition: { kind: "source", filter: { manaSpent: [{ type: "W", amount: { op: "gte", n: 1 } }] } },
        then: { kind: "prohibit", who: 0, spells: { filter: { type: "creature" }, label: "creature spells" } },
      },
    ],
  },
});
