import { defineCard } from "../define.js";

// EDHREC rank 20865.
//
// Rulings:
//   [2019-10-04] Flutterfox gaining flying after it becomes blocked won't remove the blocking
//     creature from combat or cause Flutterfox to become unblocked.
//   [2019-10-04] You control Auras that you put onto the battlefield attached to a permanent you
//     don't control.

const TEXT = "As long as you control an artifact or enchantment, this creature has flying.";

export default defineCard({
  name: "Flutterfox",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Fox"],
  power: 2,
  toughness: 2,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "controls", filter: { typesAnyOf: ["artifact", "enchantment"] }, atLeast: 1 },
      grantKeywords: ["flying"],
      text: TEXT,
    },
  ],
});
