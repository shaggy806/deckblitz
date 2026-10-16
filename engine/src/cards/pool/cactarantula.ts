import { defineCard } from "../define.js";

// EDHREC rank 16308.
//
// Rulings:
//   [2024-04-12] If a spell or ability targets Cactarantula more than once, its last ability still
//     triggers only once.
//   [2024-04-12] Cactarantula still costs only {1} less to cast if you control multiple Deserts.
//   [2024-04-12] Cactarantula’s last ability resolves before the spell or ability that caused it
//     to trigger. It resolves even if that spell is countered.
//   [2024-04-12] Once you announce that you’re casting Cactarantula, no player may take actions
//     until the spell has been paid for. Notably, opponents can’t try to change whether you
//     control a Desert.

export default defineCard({
  name: "Cactarantula",
  manaCost: "{4}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Plant", "Spider"],
  power: 6,
  toughness: 5,
  keywords: ["reach"],
  text: "This spell costs {1} less to cast if you control a Desert.\nReach\nWhenever this creature becomes the target of a spell or ability an opponent controls, you may draw a card.",
  // Only {1} less however many Deserts (the ruling).
  selfCostReduction: {
    condition: { kind: "controls", filter: { subtype: "Desert" }, atLeast: 1 },
    reduceGeneric: 1,
  },
  triggered: [
    {
      trigger: { on: "becomes-target", who: "self", byOpponentOnly: true },
      targets: [],
      effect: { kind: "may", prompt: "Draw a card?", effect: { kind: "draw", amount: 1 } },
      resolve: null,
      text: "Whenever this creature becomes the target of a spell or ability an opponent controls, you may draw a card.",
    },
  ],
});
