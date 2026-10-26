import { defineCard } from "../define.js";

// EDHREC rank 28993.

export default defineCard({
  name: "Rainbow Efreet",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Efreet"],
  power: 3,
  toughness: 1,
  keywords: ["flying"],
  text: "Flying\n{U}{U}: This creature phases out. (While it's phased out, it's treated as though it doesn't exist. It phases in before you untap during your next untap step.)",
  activated: [
    {
      cost: { mana: "{U}{U}", tap: false },
      targets: [],
      effect: { kind: "phase-out", target: "source" },
      resolve: null,
      text: "{U}{U}: This creature phases out.",
    },
  ],
});
