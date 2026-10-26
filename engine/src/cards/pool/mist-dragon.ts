import { defineCard } from "../define.js";

export default defineCard({
  name: "Mist Dragon",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Dragon"],
  power: 4,
  toughness: 4,
  text: "{0}: This creature gains flying. (This effect lasts indefinitely.)\n{0}: This creature loses flying. (This effect lasts indefinitely.)\n{3}{U}{U}: This creature phases out. (While it's phased out, it's treated as though it doesn't exist. It phases in before you untap during your next untap step.)",
  activated: [
    {
      cost: { mana: "{0}", tap: false },
      targets: [],
      effect: { kind: "grant-keyword", target: "source", keyword: "flying", duration: "permanent" },
      resolve: null,
      text: "{0}: This creature gains flying.",
    },
    {
      cost: { mana: "{0}", tap: false },
      targets: [],
      effect: { kind: "lose-keywords", target: "source", keywords: ["flying"], duration: "permanent" },
      resolve: null,
      text: "{0}: This creature loses flying.",
    },
    {
      cost: { mana: "{3}{U}{U}", tap: false },
      targets: [],
      effect: { kind: "phase-out", target: "source" },
      resolve: null,
      text: "{3}{U}{U}: This creature phases out.",
    },
  ],
});
