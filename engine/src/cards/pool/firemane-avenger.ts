import { defineCard } from "../define.js";

// EDHREC rank 10863.
//
// Rulings:
//   [2013-01-24] If Firemane Avenger's battalion ability resolves but some or all of the damage is
//     prevented, you'll still gain 3 life.
//   [2013-01-24] If the target permanent or player is an illegal target when Firemane Avenger's
//     battalion ability tries to resolve, the ability won't resolve and none of its effects will
//     happen. You won't gain life.
//   [2013-04-15] Once a battalion ability has triggered, it doesn't matter how many creatures are
//     still attacking when that ability resolves.
//   [2013-04-15] The effects of battalion abilities vary from card to card. Read each card
//     carefully.
//   [2024-01-12] The three attacking creatures don't have to be attacking the same player,
//     planeswalker, or battle.

export default defineCard({
  name: "Firemane Avenger",
  manaCost: "{2}{R}{W}",
  colors: ["W", "R"],
  types: ["creature"],
  subtypes: ["Angel"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: "Flying\nBattalion — Whenever this creature and at least two other creatures attack, this creature deals 3 damage to any target and you gain 3 life.",
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      whileCondition: { kind: "controls", filter: { type: "creature", attacking: true }, atLeast: 3 },
      targets: ["any-target"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "damage", target: 0, amount: 3 },
          { kind: "gain-life", amount: 3 },
        ],
      },
      resolve: null,
      text: "Battalion — Whenever this creature and at least two other creatures attack, this creature deals 3 damage to any target and you gain 3 life.",
    },
  ],
});
