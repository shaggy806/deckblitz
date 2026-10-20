import { defineCard } from "../define.js";

// EDHREC rank 14794. Modern Horizons 2.
//
// "Activate only if Skyblade's Boon is on the battlefield or in your
// graveyard" is one ability that works from either zone; a card is in one
// zone at a time, so it's authored as the same ability twice — once on the
// battlefield, once from the graveyard (`zone`, `staysInZone`, owner only).
// Either way it returns only if the Boon is still where it was as the
// ability resolves (its ruling; rule 400.7).
const RETURN_TEXT =
  "{2}{W}: Return Skyblade's Boon to its owner's hand. Activate only if Skyblade's Boon is on the battlefield or in your graveyard.";

export default defineCard({
  name: "Skyblade's Boon",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nEnchanted creature gets +1/+1 and has flying.\n" + RETURN_TEXT,
  targets: ["creature"],
  activated: [
    {
      cost: { mana: "{2}{W}", tap: false },
      targets: [],
      effect: { kind: "return-to-hand", target: "source" },
      resolve: null,
      text: RETURN_TEXT,
    },
    {
      cost: { mana: "{2}{W}", tap: false },
      zone: "graveyard",
      staysInZone: true,
      targets: [],
      effect: { kind: "return-to-hand", target: "source", from: "graveyard" },
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [1, 1],
      grantKeywords: ["flying"],
      text: "Enchanted creature gets +1/+1 and has flying.",
    },
  ],
});
