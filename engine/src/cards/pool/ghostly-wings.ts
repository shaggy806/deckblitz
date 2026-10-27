import { defineCard } from "../define.js";

// Torment. EDHREC rank 21413.
//
// Rulings: with Ghostly Wings gone before the ability resolves, the creature
// it last enchanted is returned if it's still there — `"attached"` reads the
// departed Aura's last host in the same stint. Activating it again after the
// first resolves finds nothing to return.

const BOUNCE_TEXT = "Discard a card: Return enchanted creature to its owner's hand.";

export default defineCard({
  name: "Ghostly Wings",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\nEnchanted creature gets +1/+1 and has flying.\n${BOUNCE_TEXT}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [1, 1],
      grantKeywords: ["flying"],
      text: "Enchanted creature gets +1/+1 and has flying.",
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: false, discard: { count: 1 } },
      targets: [],
      effect: { kind: "return-to-hand", target: "attached" },
      resolve: null,
      text: BOUNCE_TEXT,
    },
  ],
});
