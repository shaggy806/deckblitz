import { defineCard } from "../define.js";

// EDHREC rank 28787.

export default defineCard({
  name: "Sea Monster",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Serpent"],
  power: 6,
  toughness: 6,
  text: "This creature can't attack unless defending player controls an Island.",
  static: [
    {
      affects: { scope: "self" },
      restrictions: [{ kind: "cant-attack", unlessDefender: { controls: { subtype: "Island" } } }],
      text: "This creature can't attack unless defending player controls an Island.",
    },
  ],
});
