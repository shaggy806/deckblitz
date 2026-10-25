import { defineCard } from "../define.js";

// EDHREC rank 29468. Any damage to an opponent, combat or not; its controller
// sacrifices the land, not the player dealt damage (the rulings).

const TEXT = "Whenever this creature deals damage to an opponent, sacrifice a land.";

export default defineCard({
  name: "Ruinous Minotaur",
  manaCost: "{1}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Minotaur", "Warrior"],
  power: 5,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "deals-damage", who: "self", to: "opponent" },
      targets: [],
      effect: { kind: "sacrifice", who: "you", filter: { type: "land" }, count: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
