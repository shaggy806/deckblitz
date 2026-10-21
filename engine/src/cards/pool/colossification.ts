import { defineCard } from "../define.js";

// EDHREC rank 4085.
//
// Rulings:
//   [2020-04-17] Colossification can be attached to a creature that's already tapped. Its middle
//     ability won't have any effect, but its last ability certainly will.

const ENTERS = "When this Aura enters, tap enchanted creature.";

export default defineCard({
  name: "Colossification",
  manaCost: "{5}{G}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${ENTERS}\nEnchanted creature gets +20/+20.`,
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "tap", target: "attached" },
      resolve: null,
      text: ENTERS,
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [20, 20],
      text: "Enchanted creature gets +20/+20.",
    },
  ],
});
