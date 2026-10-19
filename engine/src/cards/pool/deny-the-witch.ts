import { defineCard } from "../define.js";

// EDHREC rank 9806.
//
// One slot that takes any spell or any activated or triggered ability
// (Return the Favor's `stack` spec). Its controller loses life equal to the
// creatures you control as this resolves — whether or not it could be
// countered (Undermine's shape). The life loss is applied first: an ability
// has no last-known controller once it's countered off the stack, and nothing
// can see the order inside one resolution.
const TEXT =
  "Counter target spell, activated ability, or triggered ability. Its controller loses life equal to the number of creatures you control.";

export default defineCard({
  name: "Deny the Witch",
  manaCost: "{1}{W}{U}{B}",
  colors: ["W", "U", "B"],
  types: ["instant"],
  text: TEXT,
  targets: [{ kind: "stack", spells: "any", abilities: true }],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "lose-life",
        amount: { countOf: { type: "creature", controlledBy: "you" } },
        toControllerOfTarget: 0,
      },
      { kind: "counter", target: 0 },
    ],
  },
});
