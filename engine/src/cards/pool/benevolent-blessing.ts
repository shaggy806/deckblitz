import { defineCard } from "../define.js";

// The colour is named as it enters (rule 614.12). Rule 702.16p: the Auras and
// Equipment you control that were already on the creature when this protection
// began — this Aura among them — don't fall off; nothing of that colour can
// become attached afterwards, and another instance of the same protection
// removes them as normal.
const STATIC_TEXT =
  "Enchanted creature has protection from the chosen color. This effect doesn't remove Auras and Equipment you control that are already attached to it.";

export default defineCard({
  name: "Benevolent Blessing",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  keywords: ["flash"],
  text: `Flash\nEnchant creature\nAs this Aura enters, choose a color.\n${STATIC_TEXT}`,
  targets: ["creature"],
  chooseOnEnter: ["W", "U", "B", "R", "G"],
  static: [
    {
      affects: { scope: "attached" },
      protection: { chosenColor: true, doesntRemoveAttached: true },
      text: STATIC_TEXT,
    },
  ],
});
