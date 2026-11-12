import { defineCard } from "../define.js";

// EDHREC rank 13690. "That player" is the attacked player, fixed as the
// attack trigger fires (`"trigger-player"`), so removing the attacker from
// combat doesn't change who loses the life.

export default defineCard({
  name: "Calculating Lich",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie", "Wizard"],
  power: 5,
  toughness: 5,
  keywords: ["menace"],
  text: "Menace\nWhenever a creature attacks one of your opponents, that player loses 1 life.",
  triggered: [
    {
      trigger: { on: "attacks", who: "any", filter: { type: "creature", attackingOpponent: true } },
      targets: [],
      effect: { kind: "lose-life", amount: 1, who: "trigger-player" },
      resolve: null,
      text: "Whenever a creature attacks one of your opponents, that player loses 1 life.",
    },
  ],
});
