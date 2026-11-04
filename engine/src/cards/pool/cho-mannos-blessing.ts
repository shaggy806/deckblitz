import { defineCard } from "../define.js";

// The colour is named as it enters (rule 614.12); the protection spares this Aura
// (rule 702.16n), so it stays on naming white.
const STATIC_TEXT = "Enchanted creature has protection from the chosen color. This effect doesn't remove this Aura.";

export default defineCard({
  name: "Cho-Manno's Blessing",
  manaCost: "{W}{W}",
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
      protection: { chosenColor: true, doesntRemoveSource: true },
      text: STATIC_TEXT,
    },
  ],
});
