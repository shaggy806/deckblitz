import { defineCard } from "../define.js";

// EDHREC rank 24506.
//
// Rulings:
//   [2013-04-15] Once a battalion ability has triggered, it doesn't matter how many creatures are
//     still attacking when that ability resolves.
//   [2013-04-15] The effects of battalion abilities vary from card to card. Read each card
//     carefully.
//   [2024-01-12] The three attacking creatures don't have to be attacking the same player,
//     planeswalker, or battle.

export default defineCard({
  name: "Bomber Corps",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 1,
  toughness: 2,
  text: "Battalion — Whenever this creature and at least two other creatures attack, this creature deals 1 damage to any target.",
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      whileCondition: { kind: "controls", filter: { type: "creature", attacking: true }, atLeast: 3 },
      targets: ["any-target"],
      effect: { kind: "damage", target: 0, amount: 1 },
      resolve: null,
      text: "Battalion — Whenever this creature and at least two other creatures attack, this creature deals 1 damage to any target.",
    },
  ],
});
