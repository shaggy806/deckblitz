import { defineCard } from "../define.js";

const TEXT = "As long as you've surveilled this turn, this creature has deathtouch and \"Whenever this creature deals combat damage to a player, you draw a card.\"";

export default defineCard({
  name: "Darkblade Agent",
  manaCost: "{1}{U}{B}",
  colors: ["U", "B"],
  types: ["creature"],
  subtypes: ["Human", "Assassin"],
  power: 2,
  toughness: 3,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "turn-stat", stat: "surveilled", who: "you", atLeast: 1 },
      grantKeywords: ["deathtouch"],
      grantsTriggered: [
        {
          trigger: { on: "deals-combat-damage-to-player", who: "self" },
          targets: [],
          effect: { kind: "draw", amount: 1 },
          resolve: null,
          text: "Whenever this creature deals combat damage to a player, you draw a card.",
        },
      ],
      text: TEXT,
    },
  ],
});
