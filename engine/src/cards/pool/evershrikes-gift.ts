import { defineCard } from "../define.js";

// EDHREC rank 17728.
//
// Summoned Dromedary's graveyard return with Gristle Glutton's blight cost:
// the creature is chosen as the cost is paid, and the ability can't be
// activated without a creature to blight (rule 701.68b).
const RETURN_TEXT =
  "{1}{W}, Blight 2: Return this card from your graveyard to your hand. Activate only as a sorcery.";

export default defineCard({
  name: "Evershrike's Gift",
  manaCost: "{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\nEnchanted creature gets +1/+0 and has flying.\n${RETURN_TEXT} (To blight 2, put two -1/-1 counters on a creature you control.)`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [1, 0],
      grantKeywords: ["flying"],
      text: "Enchanted creature gets +1/+0 and has flying.",
    },
  ],
  activated: [
    {
      cost: { mana: "{1}{W}", tap: false, blight: 2 },
      targets: [],
      effect: { kind: "return-to-hand", target: "source", from: "graveyard" },
      zone: "graveyard",
      staysInZone: true,
      sorcerySpeed: true,
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
});
