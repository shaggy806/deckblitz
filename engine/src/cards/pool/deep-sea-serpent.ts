import { defineCard } from "../define.js";


export default defineCard({
  name: "Deep-Sea Serpent",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Serpent"],
  power: 5,
  toughness: 5,
  text: "This creature can't attack unless defending player controls an Island.",
  static: [
    {
      affects: { scope: "self" },
      cantAttackUnlessDefender: { controls: { subtype: "Island" } },
      text: "This creature can't attack unless defending player controls an Island.",
    },
  ],
});
