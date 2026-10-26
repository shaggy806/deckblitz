import { defineCard } from "../define.js";

// Urza's Legacy (ULG). EDHREC rank 22324. Forced Worship's restriction and
// Brilliant Halo's return trigger.

const RETURN_TEXT = "When this Aura is put into a graveyard from the battlefield, return it to its owner's hand.";

export default defineCard({
  name: "Cessation",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\nEnchanted creature can't attack.\n${RETURN_TEXT}`,
  targets: ["creature"],
  static: [{ affects: { scope: "attached" }, restrictions: ["cant-attack"], text: "Enchanted creature can't attack." }],
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
