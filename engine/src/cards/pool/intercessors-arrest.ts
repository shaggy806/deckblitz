import { defineCard } from "../define.js";

const TEXT =
  "Enchanted permanent can't attack, block, or crew Vehicles. Its activated abilities can't be activated unless they're mana abilities.";

export default defineCard({
  name: "Intercessor's Arrest",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant permanent\n${TEXT}`,
  targets: ["permanent"],
  static: [
    {
      affects: { scope: "attached" },
      restrictions: ["cant-attack", "cant-block", "cant-crew"],
      prohibits: [{ act: "activate", who: "each-player", of: { hostOfSource: true }, except: ["mana"] }],
      text: TEXT,
    },
  ],
});
