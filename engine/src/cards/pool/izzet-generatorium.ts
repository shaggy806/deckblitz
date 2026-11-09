import { defineCard } from "../define.js";

export default defineCard({
  name: "Izzet Generatorium",
  manaCost: "{U}{R}",
  colors: ["U", "R"],
  types: ["artifact"],
  text: "If you would get one or more {E} (energy counters), you get that many plus one {E} instead.\n{T}: Draw a card. Activate only if you've paid or lost four or more {E} this turn.",
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "would-add-counter", onPlayers: "you", counterKind: "energy", instead: { modify: { plus: 1 } } },
      text: "If you would get one or more {E} (energy counters), you get that many plus one {E} instead.",
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true },
      condition: { kind: "turn-stat", stat: "energy-paid-or-lost", who: "you", atLeast: 4 },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "{T}: Draw a card. Activate only if you've paid or lost four or more {E} this turn.",
    },
  ],
});
