import { defineCard } from "../define.js";

const TEXT =
  "Whenever this creature deals damage to a player, that player gets two poison counters. (A player with ten or more poison counters loses the game.)";

// Any damage, not only combat damage (Pit Scorpion's shape).
export default defineCard({
  name: "Marsh Viper",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Snake"],
  power: 1,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "deals-damage", who: "self", to: "player" },
      targets: [],
      effect: { kind: "add-player-counters", counter: "poison", amount: 2, who: "trigger-player" },
      resolve: null,
      text: TEXT,
    },
  ],
});
