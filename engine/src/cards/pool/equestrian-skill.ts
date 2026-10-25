import { defineCard } from "../define.js";

// EDHREC rank 26689. Sea Legs' "as long as enchanted creature is a …"
// condition.

const TRAMPLE_TEXT = "As long as enchanted creature is a Human, it has trample.";

export default defineCard({
  name: "Equestrian Skill",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\nEnchanted creature gets +3/+3.\n${TRAMPLE_TEXT}`,
  targets: ["creature"],
  static: [
    { affects: { scope: "attached" }, grantPt: [3, 3], text: "Enchanted creature gets +3/+3." },
    {
      affects: { scope: "attached" },
      condition: { kind: "source", filter: { attachedTo: { subtype: "Human" } } },
      grantKeywords: ["trample"],
      text: TRAMPLE_TEXT,
    },
  ],
});
