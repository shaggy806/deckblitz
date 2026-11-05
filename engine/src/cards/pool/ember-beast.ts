import { defineCard } from "../define.js";

// EDHREC rank 30315.

export default defineCard({
  name: "Ember Beast",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 3,
  toughness: 4,
  text: "This creature can't attack or block alone.",
  static: [
    {
      affects: { scope: "self" },
      restrictions: ["cant-attack-alone", "cant-block-alone"],
      text: "This creature can't attack or block alone.",
    },
  ],
});
