import { defineCard } from "../define.js";

// Mirage (MIR). EDHREC rank 28600.

export default defineCard({
  name: "Merfolk Raiders",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Merfolk", "Soldier"],
  power: 2,
  toughness: 3,
  keywords: ["islandwalk", "phasing"],
  text: "Islandwalk (This creature can't be blocked as long as defending player controls an Island.)\nPhasing (This phases in or out before you untap during each of your untap steps. While it's phased out, it's treated as though it doesn't exist.)",
});
