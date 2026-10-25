import { defineCard } from "../define.js";

// EDHREC rank 9854. Bestow (rule 702.103) as Nyxborn Eidolon has it: cast
// bestowed it's an Aura granting the bonus; unattached it's the 4/4 again.
const GRANT_TEXT = "Enchanted creature gets +4/+4 and has flying, first strike, vigilance, trample, and lifelink.";

export default defineCard({
  name: "Chromanticore",
  manaCost: "{W}{U}{B}{R}{G}",
  colors: ["W", "U", "B", "R", "G"],
  types: ["enchantment", "creature"],
  subtypes: ["Manticore"],
  power: 4,
  toughness: 4,
  keywords: ["flying", "first-strike", "vigilance", "trample", "lifelink"],
  bestow: "{2}{W}{U}{B}{R}{G}",
  text: `Bestow {2}{W}{U}{B}{R}{G} (If you cast this card for its bestow cost, it's an Aura spell with enchant creature. It becomes a creature again if it's not attached.)\nFlying, first strike, vigilance, trample, lifelink\n${GRANT_TEXT}`,
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [4, 4],
      grantKeywords: ["flying", "first-strike", "vigilance", "trample", "lifelink"],
      text: GRANT_TEXT,
    },
  ],
});
