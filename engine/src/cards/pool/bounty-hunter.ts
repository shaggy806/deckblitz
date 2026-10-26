import { defineCard } from "../define.js";

// EDHREC rank 14301.

export default defineCard({
  name: "Bounty Hunter",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Archer", "Minion"],
  power: 2,
  toughness: 2,
  text: "{T}: Put a bounty counter on target nonblack creature.\n{T}: Destroy target creature with a bounty counter on it.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["nonblack-creature"],
      effect: { kind: "add-counter", target: 0, counter: "bounty", amount: 1 },
      resolve: null,
      text: "{T}: Put a bounty counter on target nonblack creature.",
    },
    {
      cost: { mana: null, tap: true },
      targets: [
        {
          kind: "permanent",
          whose: "any",
          filter: { type: "creature", counters: { kind: "bounty", compare: { op: "gte", n: 1 } } },
        },
      ],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: "{T}: Destroy target creature with a bounty counter on it.",
    },
  ],
});
