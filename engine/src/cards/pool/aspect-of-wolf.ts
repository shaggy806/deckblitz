import { defineCard } from "../define.js";

// EDHREC rank 23559.
//
// Blanchwood Armor's shape, the count halved: power rounds down and
// toughness up (`round`), so the two add up to the Forests. "You" is the
// Aura's controller.
const TEXT =
  "Enchanted creature gets +X/+Y, where X is half the number of Forests you control, rounded down, and Y is half the number of Forests you control, rounded up.";

export default defineCard({
  name: "Aspect of Wolf",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${TEXT}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantPtPerCount: { filter: { subtype: "Forest", controlledBy: "you" }, step: 2, round: ["down", "up"], pt: [1, 1] },
      text: TEXT,
    },
  ],
});
