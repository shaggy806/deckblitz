import { defineCard } from "../define.js";

const RETURN_TEXT = "{2}{G}: Return this card from your graveyard to your hand.";

export default defineCard({
  name: "Talons of Wildwood",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\nEnchanted creature gets +1/+1 and has trample. (It can deal excess combat damage to the player or planeswalker it's attacking.)\n${RETURN_TEXT}`,
  targets: ["creature"],
  activated: [
    {
      cost: { mana: "{2}{G}", tap: false },
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
      grantKeywords: ["trample"],
      text: "Enchanted creature gets +1/+1 and has trample.",
    },
  ],
});
