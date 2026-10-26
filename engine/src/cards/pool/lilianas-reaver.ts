import { defineCard } from "../define.js";

// EDHREC rank 10026.
//
// Rulings:
//   [2013-07-01] If the player’s hand is empty when the triggered ability resolves, you’ll still
//     put a Zombie token onto the battlefield.

const TEXT =
  "Whenever this creature deals combat damage to a player, that player discards a card and you create a tapped 2/2 black Zombie creature token.";

export default defineCard({
  name: "Liliana's Reaver",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie"],
  power: 4,
  toughness: 3,
  keywords: ["deathtouch"],
  text: `Deathtouch\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "discard", target: "trigger-player", amount: 1 },
          { kind: "create-token", token: "Zombie Token", count: 1, tapped: true },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
