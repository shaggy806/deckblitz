import { defineCard } from "../define.js";

// Lorwyn (LRW). EDHREC rank 27785. The creature is still on the battlefield
// when the clash's damage goes to its controller (no state-based actions
// mid-resolution).
export default defineCard({
  name: "Lash Out",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Lash Out deals 3 damage to target creature. Clash with an opponent. If you win, Lash Out deals 3 damage to that creature's controller. (Each clashing player reveals the top card of their library, then puts that card on their choice of the top or bottom. A player wins if their card had a greater mana value.)",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", amount: 3, target: 0 },
      { kind: "clash", won: { kind: "damage", amount: 3, toControllerOfTarget: 0 } },
    ],
  },
});
