import { defineCard } from "../define.js";

// Flood the Engine's lock on a creature, with every counter of every kind
// taken off it as the Aura enters (`counter: "any"`, `amount: "all"`).

const TAP_TEXT = "When this Aura enters, tap enchanted creature and remove all counters from it.";
const LOCK_TEXT = "Enchanted creature loses all abilities and doesn't untap during its controller's untap step.";

export default defineCard({
  name: "Enchanted River's Grasp",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${TAP_TEXT}\n${LOCK_TEXT}`,
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "tap", target: "attached" },
          { kind: "remove-counter", target: "attached", counter: "any", amount: "all" },
        ],
      },
      resolve: null,
      text: TAP_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      loseAllAbilities: true,
      restrictions: ["doesnt-untap"],
      text: LOCK_TEXT,
    },
  ],
});
