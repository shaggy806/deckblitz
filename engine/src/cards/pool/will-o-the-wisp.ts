import { defineCard } from "../define.js";

export default defineCard({
  name: "Will-o'-the-Wisp",
  manaCost: "{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 0,
  toughness: 1,
  keywords: ["flying"],
  text: "Flying (This creature can't be blocked except by creatures with flying or reach.)\n{B}: Regenerate this creature. (The next time this creature would be destroyed this turn, instead tap it, remove it from combat, and heal all damage on it.)",
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
