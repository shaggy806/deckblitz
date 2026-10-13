import { defineCard } from "../define.js";

// EDHREC rank 1569.

export default defineCard({
  name: "Resourceful Defense",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: "Whenever a permanent you control leaves the battlefield, if it had counters on it, put those counters on target permanent you control.\n{4}{W}: Move any number of counters from target permanent you control onto a second target permanent you control.",
  activated: [
    {
      // How many of each kind is chosen as it resolves, none included. Two
      // instances of "target" (rule 115.3): one permanent may be both, and
      // then nothing moves (rule 122.5).
      cost: { mana: "{4}{W}", tap: false },
      targets: [
        { kind: "permanent", whose: "you", filter: {} },
        { kind: "permanent", whose: "you", filter: {} },
      ],
      effect: { kind: "move-counters", from: 0, to: 1, amount: "any" },
      resolve: null,
      text: "{4}{W}: Move any number of counters from target permanent you control onto a second target permanent you control.",
    },
  ],
  triggered: [
    {
      // "If it had counters on it" reads it as it left; "those counters" are
      // each kind it had, put on rather than moved (rule 122.8).
      trigger: {
        on: "leaves-battlefield",
        who: "you-control",
        filter: { counters: { compare: { op: "gte", n: 1 } } },
      },
      targets: [{ kind: "permanent", whose: "you", filter: {} }],
      effect: { kind: "put-counters-of", of: "trigger-object", target: 0 },
      resolve: null,
      text: "Whenever a permanent you control leaves the battlefield, if it had counters on it, put those counters on target permanent you control.",
    },
  ],
});
