import { defineCard } from "../define.js";

// EDHREC rank 4197.
//
// Rulings:
//   [2019-05-03] If the target creature is an illegal target by the time Ob Nixilis's last ability
//     tries to resolve, the ability doesn't resolve. No player draws two cards. If the target is
//     legal but not destroyed (most likely because it has indestructible), its controller does
//     draw two cards.
//   [2019-05-03] If Ob Nixilis leaves the battlefield before his last ability resolves, most
//     likely because he only had 2 loyalty when you activated the ability, his first ability won't
//     exist to trigger when the creature's controller draws two cards.

export default defineCard({
  name: "Ob Nixilis, the Hate-Twisted",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Nixilis"],
  loyalty: 5,
  text: "Whenever an opponent draws a card, Ob Nixilis deals 1 damage to that player.\n−2: Destroy target creature. Its controller draws two cards.",
  activated: [
    {
      loyaltyCost: -2,
      cost: { mana: null, tap: false },
      targets: ["creature"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "destroy", target: 0 },
          { kind: "draw", who: { controllerOf: 0 }, amount: 2 },
        ],
      },
      resolve: null,
      text: "−2: Destroy target creature. Its controller draws two cards.",
    },
  ],
  triggered: [
    {
      trigger: { on: "draws", who: "opponent" },
      targets: [],
      effect: { kind: "damage", amount: 1, who: "trigger-player" },
      resolve: null,
      text: "Whenever an opponent draws a card, Ob Nixilis deals 1 damage to that player.",
    },
  ],
});
