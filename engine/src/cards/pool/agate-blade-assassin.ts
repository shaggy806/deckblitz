import { defineCard } from "../define.js";

// EDHREC rank 9330. Bloomburrow.
//
// Restless Fortress's drain: the defending player is the player it attacks,
// or the controller of the planeswalker it attacks.
const TEXT = "Whenever this creature attacks, defending player loses 1 life and you gain 1 life.";

export default defineCard({
  name: "Agate-Blade Assassin",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Lizard", "Assassin"],
  power: 1,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "lose-life", who: "trigger-player", amount: 1 },
          { kind: "gain-life", amount: 1 },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
