import { defineCard } from "../define.js";


export default defineCard({
  name: "Armored Galleon",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Pirate"],
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
