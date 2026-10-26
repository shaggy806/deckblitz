import { defineCard } from "../define.js";

// Weatherlight (WTH). EDHREC rank 31393.

export default defineCard({
  name: "Tolarian Drake",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Drake"],
  power: 2,
  toughness: 4,
  keywords: ["flying", "phasing"],
  text: "Flying\nPhasing (This phases in or out before you untap during each of your untap steps. While it's phased out, it's treated as though it doesn't exist.)",
});
