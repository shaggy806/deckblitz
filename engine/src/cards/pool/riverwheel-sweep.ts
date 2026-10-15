import { defineCard } from "../define.js";

// EDHREC rank 20701.
//
// Rulings:
//   [2025-04-04] If the target creature is an illegal target as Riverwheel Sweep tries to
//     resolve, it won't resolve and none of its effects will happen. You won't exile any cards.
//   [2025-04-04] You pay all costs and follow all timing rules for cards played this way.
//
// The impulse is Heroes' Hangout's "exile two, choose one" (the choice made
// as it resolves, the other card left in exile).

export default defineCard({
  name: "Riverwheel Sweep",
  manaCost: "{2/U}{2/R}{2/W}",
  colors: ["W", "U", "R"],
  types: ["sorcery"],
  text: "Tap target creature. Put three stun counters on it. (If a permanent with a stun counter would become untapped, remove one from it instead.)\nExile the top two cards of your library. Choose one of them. Until the end of your next turn, you may play that card.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "tap", target: 0 },
      { kind: "add-counter", target: 0, counter: "stun", amount: 3 },
      { kind: "impulse-exile", amount: 2, duration: "your-next-turn", choose: 1 },
    ],
  },
});
