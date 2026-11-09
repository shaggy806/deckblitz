import { defineCard } from "../define.js";

const TEXT = "Enchanted land has indestructible and can't be enchanted by other Auras.";

export default defineCard({
  name: "Consecrate Land",
  manaCost: "{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant land\n${TEXT}`,
  targets: ["land"],
  static: [
    { affects: { scope: "attached" }, grantKeywords: ["indestructible"], text: TEXT },
    {
      affects: { scope: "self" },
      prohibits: [{ act: "be-attached", attachment: "aura", other: true, object: { hostOfSource: true } }],
      text: TEXT,
    },
  ],
});
