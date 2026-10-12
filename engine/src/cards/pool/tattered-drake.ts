import { defineCard } from "../define.js";

export default defineCard({
  name: "Tattered Drake",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Zombie", "Drake"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: "Flying\n{B}: Regenerate this creature.",
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
