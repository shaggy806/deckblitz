import { defineCard } from "../define.js";

// Urza's Saga (USG). EDHREC rank 31272. Thunderbreak Regent's shape without
// the opponent-only limit: the trigger fills the "player" slot with the
// controller of the targeting spell or ability — Retromancer's own
// controller included.

const TEXT =
  "Whenever this creature becomes the target of a spell or ability, this creature deals 3 damage to that spell or ability's controller.";

export default defineCard({
  name: "Retromancer",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Lizard", "Shaman"],
  power: 3,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "becomes-target", who: "self" },
      targets: ["player"],
      effect: { kind: "damage", amount: 3, target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
