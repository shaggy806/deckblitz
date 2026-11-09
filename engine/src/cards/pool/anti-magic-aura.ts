import { defineCard } from "../define.js";

export default defineCard({
  name: "Anti-Magic Aura",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nEnchanted creature can't be the target of spells and can't be enchanted by other Auras.",
  targets: ["creature"],
  static: [
    {
      affects: { scope: "self" },
      prohibits: [
        { act: "be-targeted", object: { hostOfSource: true }, only: "spells" },
        { act: "be-attached", attachment: "aura", other: true, object: { hostOfSource: true } },
      ],
      text: "Enchanted creature can't be the target of spells and can't be enchanted by other Auras.",
    },
  ],
});
