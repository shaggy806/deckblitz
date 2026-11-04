import { defineCard } from "../define.js";

// The colours are read as things are now, so they change as your permanents do.
// This white Aura is among those permanents and spares only itself (rule 702.16n):
// another white Aura on the creature falls off.
const STATIC_TEXT =
  "Enchanted creature has protection from each color among permanents you control. This effect doesn't remove this Aura.";

export default defineCard({
  name: "Pledge of Loyalty",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${STATIC_TEXT}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      protection: { colorsAmong: { controlledBy: "you" }, doesntRemoveSource: true },
      text: STATIC_TEXT,
    },
  ],
});
