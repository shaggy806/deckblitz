import { defineCard } from "../define.js";

// Playtest card, after the Mirrodin Pulses. The poison counters are compared
// after the opponent gets theirs.

export default defineCard({
  name: "Pulse of the Hunter Maze",
  manaCost: "{1}{G}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Target opponent gets a poison counter. Then, if you have more poison counters than that player, return Pulse of the Hunter Maze to its owner's hand.",
  targets: ["opponent"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "add-player-counters", counter: "poison", amount: 1, who: { target: 0 } },
      {
        kind: "conditional",
        condition: {
          kind: "amounts",
          left: { playerCounters: "poison" },
          op: "gt",
          right: { playerCounters: "poison", forTarget: 0 },
        },
        then: { kind: "return-to-hand", target: "source", from: "stack" },
      },
    ],
  },
});
