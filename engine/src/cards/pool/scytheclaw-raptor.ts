import { defineCard } from "../define.js";

// EDHREC rank 3276.
export default defineCard({
  name: "Scytheclaw Raptor",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Dinosaur"],
  power: 4,
  toughness: 3,
  text: "Whenever a player casts a spell, if it's not their turn, this creature deals 4 damage to them.",
  triggered: [
    {
      trigger: { on: "cast-spell", who: "any", offTurn: true },
      targets: [],
      effect: { kind: "damage", amount: 4, who: "trigger-controller" },
      resolve: null,
      text: "Whenever a player casts a spell, if it's not their turn, this creature deals 4 damage to them.",
    },
  ],
});
