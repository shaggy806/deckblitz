import { defineCard } from "../define.js";

// Rule 702.16n: this instance spares this Aura, and only it. A second Tattoo Ward
// on the creature has an instance of its own that removes the first, and the first
// removes it.

const STATIC_TEXT = "Enchanted creature gets +1/+1 and has protection from enchantments. This effect doesn't remove this Aura.";
const SAC_TEXT = "Sacrifice this Aura: Destroy target enchantment.";

export default defineCard({
  name: "Tattoo Ward",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${STATIC_TEXT}\n${SAC_TEXT}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [1, 1],
      protection: { types: ["enchantment"], doesntRemoveSource: true },
      text: STATIC_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: "self" },
      targets: [{ kind: "permanent", filter: { type: "enchantment" } }],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: SAC_TEXT,
    },
  ],
});
