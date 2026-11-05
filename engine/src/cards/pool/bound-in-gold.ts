import { defineCard } from "../define.js";

const TEXT =
  "Enchanted permanent can't attack, block, or crew Vehicles, and its activated abilities can't be activated unless they're mana abilities.";

export default defineCard({
  name: "Bound in Gold",
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
      prohibits: { who: "each-player", abilitiesOf: { hostOfSource: true }, exceptManaAbilities: true },
      text: TEXT,
    },
  ],
});
