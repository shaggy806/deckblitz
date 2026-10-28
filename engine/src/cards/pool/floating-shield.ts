import { defineCard } from "../define.js";
import type { EffectSpec } from "../../effects.js";
import type { Color } from "../../mana.js";

// EDHREC rank 24681.
//
// The sacrifice grants the colour the Aura named as it entered, not a fresh
// choice: `chosen-on-enter` reads the Aura as it last existed, since it was
// sacrificed to pay the cost.
const COLORS: readonly Color[] = ["W", "U", "B", "R", "G"];
const GRANT: EffectSpec = {
  kind: "sequence",
  effects: COLORS.map(
    (color): EffectSpec => ({
      kind: "conditional",
      condition: { kind: "chosen-on-enter", value: color },
      then: { kind: "grant-protection", target: 0, from: { colors: [color] }, duration: "end-of-turn" },
    }),
  ),
};

export default defineCard({
  name: "Floating Shield",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nAs this Aura enters, choose a color.\nEnchanted creature has protection from the chosen color. This effect doesn't remove this Aura.\nSacrifice this Aura: Target creature gains protection from the chosen color until end of turn.",
  targets: ["creature"],
  chooseOnEnter: ["W", "U", "B", "R", "G"],
  static: [
    {
      affects: { scope: "attached" },
      protection: { chosenColor: true, doesntRemoveSource: true },
      text: "Enchanted creature has protection from the chosen color. This effect doesn't remove this Aura.",
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: "self" },
      targets: ["creature"],
      effect: GRANT,
      resolve: null,
      text: "Sacrifice this Aura: Target creature gains protection from the chosen color until end of turn.",
    },
  ],
});
