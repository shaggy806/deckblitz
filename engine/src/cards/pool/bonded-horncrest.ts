import { defineCard } from "../define.js";

// EDHREC rank 27520.

export default defineCard({
  name: "Bonded Horncrest",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Dinosaur"],
  power: 5,
  toughness: 5,
  text: "This creature can't attack or block alone.",
  static: [
    {
      affects: { scope: "self" },
      restrictions: ["cant-attack-alone", "cant-block-alone"],
      text: "This creature can't attack or block alone.",
    },
  ],
});
