import { defineCard } from "../define.js";

export default defineCard({
  name: "Teferi's Drake",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Drake"],
  power: 3,
  toughness: 2,
  keywords: ["flying", "phasing"],
  text: "Flying\nPhasing (This phases in or out before you untap during each of your untap steps. While it's phased out, it's treated as though it doesn't exist.)",
});
