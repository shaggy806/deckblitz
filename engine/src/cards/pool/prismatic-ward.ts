import type { Color } from "../../mana.js";
import type { StaticAbility } from "../define.js";
import { defineCard } from "../define.js";

// One prevention per colour, each live only while that colour is the one
// chosen as this Aura entered (`chooseOnEnter`); with none chosen (put onto
// the battlefield some way that skipped the choice) none applies.

const PREVENT_TEXT = "Prevent all damage that would be dealt to enchanted creature by sources of the chosen color.";
const COLORS: readonly Color[] = ["W", "U", "B", "R", "G"];

export default defineCard({
  name: "Prismatic Ward",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\nAs this Aura enters, choose a color.\n${PREVENT_TEXT}`,
  targets: ["creature"],
  chooseOnEnter: ["W", "U", "B", "R", "G"],
  static: COLORS.map(
    (color): StaticAbility => ({
      affects: { scope: "self" },
      condition: { kind: "chosen-on-enter", value: color },
      replacement: { event: "would-deal-damage", to: "attached", source: { colors: [color] }, prevent: true },
      text: PREVENT_TEXT,
    }),
  ),
});
