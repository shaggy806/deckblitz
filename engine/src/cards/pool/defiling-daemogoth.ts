import { defineCard } from "../define.js";

// EDHREC rank 6708.
//
// Rulings:
//   [2026-03-20] The value of X is calculated at the time Defiling Daemogoth's last ability
//     resolves.
const DAMAGE_TEXT = "Whenever a creature you control deals combat damage to a player, you gain 1 life.";
const END_TEXT =
  "At the beginning of your end step, each opponent loses X life, where X is the amount of life you gained this turn.";

export default defineCard({
  name: "Defiling Daemogoth",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Demon"],
  power: 5,
  toughness: 4,
  keywords: ["menace"],
  text: `Menace\n${DAMAGE_TEXT}\n${END_TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "you-control", filter: { type: "creature" } },
      targets: [],
      effect: { kind: "gain-life", amount: 1 },
      resolve: null,
      text: DAMAGE_TEXT,
    },
    {
      // X is read as it resolves (the ruling).
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      effect: { kind: "lose-life", amount: { turnStat: "life-gained", who: "you" }, who: "each-opponent" },
      resolve: null,
      text: END_TEXT,
    },
  ],
});
