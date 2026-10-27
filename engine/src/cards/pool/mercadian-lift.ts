import { defineCard } from "../define.js";

// Mercadian Masques (MMQ). EDHREC rank 28949.
//
// Rulings:
//   Putting the card onto the battlefield is optional. When the ability resolves, you can choose
//     not to.
//
// X is the number of winch counters removed to pay the cost (Hourglass of the Lost's shape).

const WINCH = "{1}, {T}: Put a winch counter on this artifact.";
const LIFT =
  "{T}, Remove X winch counters from this artifact: You may put a creature card with mana value X from your hand onto the battlefield.";

export default defineCard({
  name: "Mercadian Lift",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: `${WINCH}\n${LIFT}`,
  activated: [
    {
      cost: { mana: "{1}", tap: true },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "winch", amount: 1 },
      resolve: null,
      text: WINCH,
    },
    {
      cost: { mana: null, tap: true, removeCounter: { kind: "winch", count: "x" } },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "hand",
        min: 0,
        max: 1,
        destination: "battlefield",
        leftover: "stay",
        filter: { type: "creature", manaValue: { op: "eq", n: { amount: "x" } } },
      },
      resolve: null,
      text: LIFT,
    },
  ],
});
