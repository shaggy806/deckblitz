import { defineCard } from "../define.js";

const STATIC = "Enchanted creature gets +3/+3 and has first strike, vigilance, and lifelink.";

// Once it's on, it doesn't count itself: with the other Aura gone it can't
// enchant that creature, and falls off as a state-based action (rule 704.5m).
export default defineCard({
  name: "Daybreak Coronet",
  manaCost: "{W}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature with another Aura attached to it\n${STATIC}`,
  targets: [
    {
      kind: "permanent",
      whose: "any",
      filter: { type: "creature", attachments: { filter: { subtype: "Aura" }, otherThanSource: true } },
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [3, 3],
      grantKeywords: ["first-strike", "vigilance", "lifelink"],
      text: STATIC,
    },
  ],
});
