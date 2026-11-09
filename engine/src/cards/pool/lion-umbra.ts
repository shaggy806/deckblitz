import { defineCard } from "../define.js";

const PT_TEXT = "Enchanted creature gets +3/+3 and has reach and vigilance.";

export default defineCard({
  name: "Lion Umbra",
  manaCost: "{G}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  keywords: ["umbra-armor"],
  targets: [{ kind: "permanent", filter: { type: "creature", modified: true } }],
  text: `Enchant modified creature (Equipment, Auras its controller controls, and counters are modifications.)\n${PT_TEXT}\nUmbra armor (If enchanted creature would be destroyed, instead remove all damage from it and destroy this Aura.)`,
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [3, 3],
      grantKeywords: ["reach", "vigilance"],
      text: PT_TEXT,
    },
  ],
});
