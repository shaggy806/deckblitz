import { defineCard } from "../define.js";

export default defineCard({
  name: "Deathbellow Raider",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Minotaur", "Berserker"],
  power: 2,
  toughness: 3,
  text: "This creature attacks each combat if able.\n{2}{B}: Regenerate this creature.",
  activated: [
    {
      cost: { mana: "{2}{B}", tap: false },
      targets: [],
      effect: { kind: "regenerate", target: "source" },
      resolve: null,
      text: "{2}{B}: Regenerate this creature.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      restrictions: ["must-attack"],
      text: "This creature attacks each combat if able.",
    },
  ],
});
