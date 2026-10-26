import { defineCard } from "../define.js";

// EDHREC rank 31081.

export default defineCard({
  name: "Breezekeeper",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Djinn"],
  power: 4,
  toughness: 4,
  keywords: ["flying", "phasing"],
  text: "Flying\nPhasing (This phases in or out before you untap during each of your untap steps. While it's phased out, it's treated as though it doesn't exist.)",
});
