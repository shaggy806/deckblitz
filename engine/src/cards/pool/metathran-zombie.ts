import { defineCard } from "../define.js";

export default defineCard({
  name: "Metathran Zombie",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Metathran", "Zombie"],
  power: 1,
  toughness: 1,
  text: "{B}: Regenerate this creature.",
  activated: [
    {
      cost: { mana: "{B}", tap: false },
      targets: [],
      effect: { kind: "regenerate", target: "source" },
      resolve: null,
      text: "{B}: Regenerate this creature.",
    },
  ],
});
