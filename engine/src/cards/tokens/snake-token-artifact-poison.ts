import { defineCard } from "../define.js";

// A 1/1 colorless Snake artifact creature token with "Whenever this creature
// deals damage to a player, that player gets a poison counter." (Serpent
// Generator).
const TEXT = "Whenever this creature deals damage to a player, that player gets a poison counter.";

export default defineCard({
  name: "Snake Token (artifact, poison)",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Snake"],
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
