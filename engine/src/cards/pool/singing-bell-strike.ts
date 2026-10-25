import { defineCard } from "../define.js";

// EDHREC rank 23159.
// It may enchant a creature that's already tapped; only the enchanted
// creature's controller can activate the granted untap (the rulings).
const ENTER_TEXT = "When this Aura enters, tap enchanted creature.";
const UNTAP_TEXT = "Enchanted creature doesn't untap during its controller's untap step.";
const GRANT_TEXT = 'Enchanted creature has "{6}: Untap this creature."';

export default defineCard({
  name: "Singing Bell Strike",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${ENTER_TEXT}\n${UNTAP_TEXT}\n${GRANT_TEXT}`,
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "tap", target: "attached" },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      restrictions: ["doesnt-untap"],
      text: UNTAP_TEXT,
    },
    {
      affects: { scope: "attached" },
      grantsActivated: [
        {
          cost: { mana: "{6}", tap: false },
          targets: [],
          effect: { kind: "untap", target: "source" },
          resolve: null,
          text: "{6}: Untap this creature.",
        },
      ],
      text: GRANT_TEXT,
    },
  ],
});
