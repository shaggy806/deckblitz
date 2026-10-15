import { defineCard } from "../define.js";

// EDHREC rank 12120.
// Rulings:
//   [2025-06-06] If the target is illegal when Choco-Comet tries to resolve, it won't resolve and
//     none of its effects will happen. You won't create a Bird token.

export default defineCard({
  name: "Choco-Comet",
  manaCost: "{X}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: 'Choco-Comet deals X damage to any target.\nCreate a 2/2 green Bird creature token with "Whenever a land you control enters, this token gets +1/+0 until end of turn."',
  targets: ["any-target"],
  // A spell whose only target is illegal doesn't resolve at all (rule
  // 608.2b), so no Bird either — the ruling.
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", amount: "x", target: 0 },
      { kind: "create-token", token: "Chocobo Bird Token", count: 1 },
    ],
  },
});
