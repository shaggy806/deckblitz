import { defineCard } from "../define.js";

// Time Spiral (TSP). EDHREC rank 17648. Maniacal Rage's static with Brilliant
// Halo's return trigger.
//
// Rulings:
//   [2022-12-08] If the target creature is an illegal target by the time Undying Rage tries to
//     resolve, it doesn't resolve. It's put into its owner's graveyard from the stack rather than
//     from the battlefield, so its last ability won't trigger.

const RETURN_TEXT = "When this Aura is put into a graveyard from the battlefield, return it to its owner's hand.";

export default defineCard({
  name: "Undying Rage",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\nEnchanted creature gets +2/+2 and can't block.\n${RETURN_TEXT}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [2, 2],
      restrictions: ["cant-block"],
      text: "Enchanted creature gets +2/+2 and can't block.",
    },
  ],
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
