import { defineCard } from "../define.js";

// Urza's Destiny. EDHREC rank 14214.
//
// Every enchantment on the battlefield, anyone's (Ancestral Mask's count with
// no controller clause).

export default defineCard({
  name: "Yavimaya Enchantress",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Druid"],
  power: 2,
  toughness: 2,
  text: "This creature gets +1/+1 for each enchantment on the battlefield.",
  static: [
    {
      affects: { scope: "self" },
      grantPtPerCount: { filter: { type: "enchantment" }, pt: [1, 1] },
      text: "This creature gets +1/+1 for each enchantment on the battlefield.",
    },
  ],
});
