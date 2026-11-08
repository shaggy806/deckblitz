import { defineCard } from "../define.js";

const PT_TEXT = "Enchanted creature gets +2/+2 for each Aura and Equipment attached to it.";
const REDIRECT_TEXT = "All damage that would be dealt to you is dealt to enchanted creature instead.";

export default defineCard({
  name: "With Great Power . . .",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  targets: ["creature-you-control"],
  text: `Enchant creature you control\n${PT_TEXT}\n${REDIRECT_TEXT}`,
  static: [
    {
      affects: { scope: "attached" },
      grantPtPerCount: {
        filter: { subtypes: ["Aura", "Equipment"], attachedTo: { isSource: true } },
        relativeToAffected: true,
        pt: [2, 2],
      },
      text: PT_TEXT,
    },
    {
      affects: { scope: "self" },
      replacement: { event: "would-deal-damage", to: "you", instead: { redirect: "attached" } },
      text: REDIRECT_TEXT,
    },
  ],
});
