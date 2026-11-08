import { defineCard } from "../define.js";

const CAST_TEXT = "You may cast this card from your graveyard by paying {2}{W} rather than paying its mana cost.";

// Its own graveyard permission for an alternative cost (rule 118.9), so no
// other alternative cost goes with it; the timing is an Aura's as ever.
export default defineCard({
  name: "Raffine's Guidance",
  manaCost: "{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\nEnchanted creature gets +1/+1.\n${CAST_TEXT}`,
  targets: ["creature"],
  static: [{ affects: { scope: "attached" }, grantPt: [1, 1], text: "Enchanted creature gets +1/+1." }],
  mayPlaySelf: { from: ["graveyard"], byPaying: "{2}{W}" },
});
