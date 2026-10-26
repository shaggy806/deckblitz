import { defineCard } from "../define.js";

// Urza's Saga (USG). EDHREC rank 19381. The return trigger is Rancor's.

const RETURN_TEXT = "When this Aura is put into a graveyard from the battlefield, return it to its owner's hand.";

export default defineCard({
  name: "Brilliant Halo",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\nEnchanted creature gets +1/+2.\n${RETURN_TEXT}`,
  targets: ["creature"],
  static: [{ affects: { scope: "attached" }, grantPt: [1, 2], text: "Enchanted creature gets +1/+2." }],
  triggered: [
    {
      trigger: { on: "leaves-battlefield", who: "self", to: ["graveyard"] },
      targets: [],
      effect: { kind: "return-to-hand", target: "source", from: "graveyard" },
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
});
