import { defineCard } from "../define.js";

// EDHREC rank 7215.
//
// Rulings:
//   [2024-11-08] Raid abilities care only that you attacked with a creature. It doesn't matter how
//     many creatures you attacked with or which player, planeswalker, or battle those creatures
//     attacked.
//   [2024-11-08] The value of X is determined only once, as Midnight Snack's last ability
//     resolves.
//   [2024-11-08] Raid abilities evaluate the entire turn to see if you attacked with a creature.
//     That creature doesn't have to still be on the battlefield. Similarly, the player,
//     planeswalker, or battle it attacked doesn't have to still be in the game or on the
//     battlefield.

const SAC_TEXT =
  "{2}{B}, Sacrifice this enchantment: Target opponent loses X life, where X is the amount of life you gained this turn.";

// The raid intervening-if is Searslicer Goblin's; X is Defiling Daemogoth's
// turn stat, read as the ability resolves.
export default defineCard({
  name: "Midnight Snack",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: `Raid — At the beginning of your end step, if you attacked this turn, create a Food token. (It's an artifact with "{2}, {T}, Sacrifice this token: You gain 3 life.")\n${SAC_TEXT}`,
  activated: [
    {
      cost: { mana: "{2}{B}", tap: false, sacrifice: "self" },
      targets: ["opponent"],
      effect: { kind: "lose-life", target: 0, amount: { turnStat: "life-gained", who: "you" } },
      resolve: null,
      text: SAC_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      condition: { kind: "turn-stat", stat: "attacked", who: "you", atLeast: 1 },
      targets: [],
      effect: { kind: "create-token", token: "Food Token", count: 1 },
      resolve: null,
      text: "Raid — At the beginning of your end step, if you attacked this turn, create a Food token.",
    },
  ],
});
