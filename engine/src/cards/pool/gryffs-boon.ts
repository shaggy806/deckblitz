import { defineCard } from "../define.js";

// EDHREC rank 7800.
//
// Rulings:
//   If you activate Gryff's Boon's last ability and the target creature becomes an illegal target
//     in response, the ability doesn't resolve and Gryff's Boon remains in your graveyard.
//
// Eagle's Rescue's graveyard return, attached to any target creature.

const RETURN_TEXT =
  "{3}{W}: Return this card from your graveyard to the battlefield attached to target creature. Activate only as a sorcery.";

export default defineCard({
  name: "Gryff's Boon",
  manaCost: "{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\nEnchanted creature gets +1/+0 and has flying.\n${RETURN_TEXT}`,
  targets: ["creature"],
  activated: [
    {
      cost: { mana: "{3}{W}", tap: false },
      zone: "graveyard",
      staysInZone: true,
      targets: ["creature"],
      effect: { kind: "put-onto-battlefield", target: "source", attachedTo: 0 },
      resolve: null,
      text: RETURN_TEXT,
      sorcerySpeed: true,
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [1, 0],
      grantKeywords: ["flying"],
      text: "Enchanted creature gets +1/+0 and has flying.",
    },
  ],
});
