import { defineCard } from "../define.js";

// The damage reads the fuse counters on it as it is now, or as it last
// existed on the battlefield (its ruling); then the target opponent gains
// control of it for good.
export default defineCard({
  name: "Pumpkin Bombs",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["artifact"],
  text: "{T}, Discard two cards: Draw three cards, then put a fuse counter on this artifact. It deals damage equal to the number of fuse counters on it to target opponent. They gain control of this artifact.",
  activated: [
    {
      cost: { mana: null, tap: true, discard: { count: 2 } },
      targets: ["opponent"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 3 },
          { kind: "add-counter", target: "source", counter: "fuse", amount: 1 },
          { kind: "damage", amount: { countersOn: "source", counter: "fuse" }, target: 0 },
          { kind: "gain-control", target: "source", untilEndOfTurn: false, who: { target: 0 } },
        ],
      },
      resolve: null,
      text: "{T}, Discard two cards: Draw three cards, then put a fuse counter on this artifact. It deals damage equal to the number of fuse counters on it to target opponent. They gain control of this artifact.",
    },
  ],
});
