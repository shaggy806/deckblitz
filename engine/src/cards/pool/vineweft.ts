import { defineCard } from "../define.js";

const RETURN_TEXT = "{4}{G}: Return this card from your graveyard to your hand.";

export default defineCard({
  name: "Vineweft",
  manaCost: "{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\nEnchanted creature gets +1/+1.\n${RETURN_TEXT}`,
  targets: ["creature"],
  static: [{ affects: { scope: "attached" }, grantPt: [1, 1], text: "Enchanted creature gets +1/+1." }],
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
