import { defineCard } from "../define.js";

// EDHREC rank 31174.

export default defineCard({
  name: "Red Cliffs Armada",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 5,
  toughness: 4,
  text: "This creature can't attack unless defending player controls an Island.",
  static: [
    {
      affects: { scope: "self" },
      cantAttackUnlessDefender: { controls: { subtype: "Island" } },
      text: "This creature can't attack unless defending player controls an Island.",
    },
  ],
});
