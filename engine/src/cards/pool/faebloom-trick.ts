import { defineCard } from "../define.js";

// EDHREC rank 7583.
//
// Rulings:
//   [2024-11-08] You don't choose a target creature at the time you cast this spell. Rather, a
//     second "reflexive" ability triggers when you create two 1/1 blue Faerie creature tokens this
//     way. You choose a target for that ability as it goes on the stack. Each player may respond
//     to this triggered ability as normal.

export default defineCard({
  name: "Faebloom Trick",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Create two 1/1 blue Faerie creature tokens with flying. When you do, tap target creature an opponent controls.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "create-token", token: "Faerie Token", count: 2 },
      {
        // A reflexive ability (rule 603.12), targeting as it goes on the stack.
        kind: "reflexive-trigger",
        targets: ["creature-an-opponent-controls"],
        effect: { kind: "tap", target: 0 },
        text: "When you do, tap target creature an opponent controls.",
      },
    ],
  },
});
