import { defineCard } from "../define.js";

// EDHREC rank 20450.

const RETURN_TEXT = "{4}{G}: Return this card from your graveyard to your hand.";

export default defineCard({
  name: "Bestial Bloodline",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\nEnchanted creature gets +2/+2.\n${RETURN_TEXT}`,
  targets: ["creature"],
  static: [{ affects: { scope: "attached" }, grantPt: [2, 2], text: "Enchanted creature gets +2/+2." }],
  activated: [
    {
      cost: { mana: "{4}{G}", tap: false },
      zone: "graveyard",
      staysInZone: true,
      targets: [],
      effect: { kind: "return-to-hand", target: "source", from: "graveyard" },
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
});
