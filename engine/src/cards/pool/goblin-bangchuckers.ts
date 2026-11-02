import { defineCard } from "../define.js";

const TEXT =
  "{T}: Flip a coin. If you win the flip, this creature deals 2 damage to any target. If you lose the flip, this creature deals 2 damage to itself.";

// The target is chosen as it's activated, win or lose (rule 601.2c), and with that
// target gone there's no flip at all (rule 608.2b).
export default defineCard({
  name: "Goblin Bangchuckers",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Warrior"],
  power: 2,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["any-target"],
      effect: {
        kind: "flip-coin",
        won: { kind: "damage", amount: 2, target: 0 },
        lost: { kind: "damage", amount: 2, target: "source" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
