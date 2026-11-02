import { defineCard } from "../define.js";

const TEXT = "You may cast spells from your hand without paying their mana costs.";

export default defineCard({
  name: "Omniscience",
  manaCost: "{7}{U}{U}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: TEXT,
  static: [{ affects: { scope: "self" }, alternativeCostForSpells: { mana: "{0}", fromHand: true }, text: TEXT }],
});
