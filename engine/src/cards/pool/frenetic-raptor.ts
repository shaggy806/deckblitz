import { defineCard } from "../define.js";

// EDHREC rank 31538. Every Beast creature, each player's — this one included.

export default defineCard({
  name: "Frenetic Raptor",
  manaCost: "{5}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Dinosaur", "Beast"],
  power: 6,
  toughness: 6,
  text: "Beasts can't block.",
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", subtype: "Beast" } },
      restrictions: ["cant-block"],
      text: "Beasts can't block.",
    },
  ],
});
