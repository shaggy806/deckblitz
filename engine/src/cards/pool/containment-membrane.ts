import { defineCard } from "../define.js";

export default defineCard({
  name: "Containment Membrane",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  alternativeCost: {
    mana: "{U}",
    keyword: "surge",
    condition: { kind: "cast-this-turn", who: "you", atLeast: 1 },
  },
  text: "Surge {U} (You may cast this spell for its surge cost if you or a teammate has cast another spell this turn.)\nEnchant creature\nEnchanted creature doesn't untap during its controller's untap step.",
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      restrictions: ["doesnt-untap"],
      text: "Enchanted creature doesn't untap during its controller's untap step.",
    },
  ],
});
