import { defineCard } from "../define.js";

// EDHREC rank 3190.
//
// Rulings:
//   [2026-03-20] If the target spell is an illegal target when Mana Sculpt tries to resolve, it
//     won't resolve and none of its effects will happen. You won't add mana at the beginning of
//     your next main phase. If the target is legal but not countered (probably because an effect
//     says that spell can't be countered) and you control a Wizard, you'll still add mana.
//
// Whether you control a Wizard is asked as Mana Sculpt resolves; the mana
// spent to cast the countered spell is read as it last was on the stack
// (rule 608.2h), when the delayed trigger resolves.

const TEXT =
  "Counter target spell. If you control a Wizard, add an amount of {C} equal to the amount of mana spent to cast that spell at the beginning of your next main phase.";

export default defineCard({
  name: "Mana Sculpt",
  manaCost: "{1}{U}{U}",
  colors: ["U"],
  types: ["instant"],
  text: TEXT,
  targets: ["spell"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "counter", target: 0 },
      {
        kind: "conditional",
        condition: { kind: "controls", filter: { subtype: "Wizard" }, atLeast: 1 },
        then: {
          kind: "delayed-trigger",
          at: { step: "main", whose: "you" },
          effect: { kind: "add-mana", mana: "C", amount: { manaSpentOf: 0 } },
          text: "Add an amount of {C} equal to the amount of mana spent to cast the countered spell.",
        },
      },
    ],
  },
});
