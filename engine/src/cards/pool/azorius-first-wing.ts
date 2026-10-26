import { defineCard } from "../define.js";

// Dissension. EDHREC rank 27553.

export default defineCard({
  name: "Azorius First-Wing",
  manaCost: "{W}{U}",
  colors: ["W", "U"],
  types: ["creature"],
  subtypes: ["Griffin"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: "Flying, protection from enchantments",
  static: [
    {
      affects: { scope: "self" },
      protection: { types: ["enchantment"] },
      text: "Protection from enchantments",
    },
  ],
});
