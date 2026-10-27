import { defineCard } from "../define.js";

const TEXT = "Enchanted creature gets +X/+X, where X is the number of creature cards in all graveyards.";

export default defineCard({
  name: "Exoskeletal Armor",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${TEXT}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantPtPerCount: { inGraveyard: { type: "creature", token: false }, pt: [1, 1] },
      text: TEXT,
    },
  ],
});
