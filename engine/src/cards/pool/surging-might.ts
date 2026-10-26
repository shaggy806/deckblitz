import { defineCard } from "../define.js";
import { ripple } from "../helpers.js";

export default defineCard({
  name: "Surging Might",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nEnchanted creature gets +2/+2.\nRipple 4 (When you cast this spell, you may reveal the top four cards of your library. You may cast spells with the same name as this spell from among those cards without paying their mana costs. Put the rest on the bottom of your library.)",
  targets: ["creature"],
  static: [{ affects: { scope: "attached" }, grantPt: [2, 2], text: "Enchanted creature gets +2/+2." }],
  triggered: [ripple(4, "Surging Might")],
});
