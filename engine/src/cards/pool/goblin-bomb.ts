import { defineCard } from "../define.js";

const UPKEEP =
  "At the beginning of your upkeep, you may flip a coin. If you win the flip, put a fuse counter on this enchantment. If you lose the flip, remove a fuse counter from this enchantment.";
const BLOW =
  "Remove five fuse counters from this enchantment and sacrifice it: It deals 20 damage to target player or planeswalker.";

export default defineCard({
  name: "Goblin Bomb",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: `${UPKEEP}\n${BLOW}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Flip a coin for Goblin Bomb?",
        effect: {
          kind: "flip-coin",
          won: { kind: "add-counter", target: "source", counter: "fuse", amount: 1 },
          // Nothing happens with no fuse counter to remove (the ruling).
          lost: { kind: "remove-counter", target: "source", counter: "fuse", amount: 1 },
        },
      },
      resolve: null,
      text: UPKEEP,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: false, removeCounter: { kind: "fuse", count: 5 }, sacrifice: "self" },
      targets: ["player-or-planeswalker"],
      effect: { kind: "damage", amount: 20, target: 0 },
      resolve: null,
      text: BLOW,
    },
  ],
});
