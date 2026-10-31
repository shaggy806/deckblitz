import { defineCard } from "../define.js";

// EDHREC rank 14420. "−X" (rule 107.3a): X announced as it's activated, up to
// the loyalty Chandra has and 0 allowed (its ruling), and that many loyalty
// counters removed — `loyaltyCost: "-x"`, the damage `amount: "x"`.

export default defineCard({
  name: "Chandra Nalaar",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Chandra"],
  loyalty: 6,
  text: "+1: Chandra Nalaar deals 1 damage to target player or planeswalker.\n−X: Chandra Nalaar deals X damage to target creature.\n−8: Chandra Nalaar deals 10 damage to target player or planeswalker and each creature that player or that planeswalker's controller controls.",
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: ["player-or-planeswalker"],
      effect: { kind: "damage", amount: 1, target: 0 },
      resolve: null,
      text: "+1: Chandra Nalaar deals 1 damage to target player or planeswalker.",
    },
    {
      loyaltyCost: "-x",
      cost: { mana: null, tap: false },
      targets: ["creature"],
      effect: { kind: "damage", amount: "x", target: 0 },
      resolve: null,
      text: "−X: Chandra Nalaar deals X damage to target creature.",
    },
    {
      loyaltyCost: -8,
      cost: { mana: null, tap: false },
      targets: ["player-or-planeswalker"],
      effect: {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "damage", amount: 10, target: 0 },
          { kind: "damage-all", filter: { type: "creature" }, amount: 10, controlledByTarget: 0 },
        ],
      },
      resolve: null,
      text: "−8: Chandra Nalaar deals 10 damage to target player or planeswalker and each creature that player or that planeswalker's controller controls.",
    },
  ],
});
