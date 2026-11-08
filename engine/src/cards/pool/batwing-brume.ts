import { defineCard } from "../define.js";

// EDHREC rank 6522.
//
// The mana spent is read on the whole cost as this resolves (the rulings), and
// a copy has none spent on it, as for Dawnglow Infusion.

export default defineCard({
  name: "Batwing Brume",
  manaCost: "{1}{W/B}",
  colors: ["W", "B"],
  types: ["instant"],
  text: "Prevent all combat damage that would be dealt this turn if {W} was spent to cast this spell. Each player loses 1 life for each attacking creature they control if {B} was spent to cast this spell. (Do both if {W}{B} was spent.)",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "conditional",
        condition: { kind: "source", filter: { manaSpent: [{ type: "W", amount: { op: "gte", n: 1 } }] } },
        then: { kind: "prevent-all-combat-damage" },
      },
      {
        kind: "conditional",
        condition: { kind: "source", filter: { manaSpent: [{ type: "B", amount: { op: "gte", n: 1 } }] } },
        then: {
          kind: "lose-life",
          who: "each-player",
          amount: { countOf: { type: "creature", attacking: true, controlledBy: "you" }, forEachPlayer: true },
        },
      },
    ],
  },
});
