import { defineCard } from "../define.js";

// Rule 702.16n: this instance removes no Aura, itself included. The creature can't
// be the target of a further coloured Aura spell, and if it gains protection from
// white another way this white Aura falls off (the rulings).
const STATIC_TEXT =
  "Enchanted creature gets +2/+2 and has protection from each color. This effect doesn't remove Auras. (It can't be blocked, targeted, or dealt damage by anything that's white, blue, black, red, or green.)";

export default defineCard({
  name: "Spectra Ward",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${STATIC_TEXT}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [2, 2],
      protection: { colors: ["W", "U", "B", "R", "G"], doesntRemoveAuras: true },
      text: STATIC_TEXT,
    },
  ],
});
