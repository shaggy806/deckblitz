import { defineCard } from "../define.js";

// Rule 702.16n: a white Aura that gives protection from white, sparing only
// itself. Another white Aura on the creature falls off, and a second White Ward's
// instance removes the first.
const STATIC_TEXT = "Enchanted creature has protection from white. This effect doesn't remove this Aura.";

export default defineCard({
  name: "White Ward",
  manaCost: "{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${STATIC_TEXT}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      protection: { colors: ["W"], doesntRemoveSource: true },
      text: STATIC_TEXT,
    },
  ],
});
