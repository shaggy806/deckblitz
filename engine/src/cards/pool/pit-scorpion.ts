import { defineCard } from "../define.js";

// EDHREC rank 27923.
//
// Any damage to a player, combat or not — Serpent Generator's Snake's trigger.

const TEXT =
  "Whenever this creature deals damage to a player, that player gets a poison counter. (A player with ten or more poison counters loses the game.)";

export default defineCard({
  name: "Pit Scorpion",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Scorpion"],
  power: 1,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "deals-damage", who: "self", to: "player" },
      targets: [],
      effect: { kind: "add-player-counters", counter: "poison", amount: 1, who: "trigger-player" },
      resolve: null,
      text: TEXT,
    },
  ],
});
