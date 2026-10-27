import { defineCard } from "../define.js";

const TEXT = "Enchanted creature gets +2/+1 and has protection from white.";

export default defineCard({
  name: "Strength of Lunacy",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  madness: { cost: "{B}" },
  text: `Enchant creature\n${TEXT}\nMadness {B} (If you discard this card, discard it into exile. When you do, cast it for its madness cost or put it into your graveyard.)`,
  targets: ["creature"],
  static: [{ affects: { scope: "attached" }, grantPt: [2, 1], protection: { colors: ["W"] }, text: TEXT }],
});
