import { defineCard } from "../define.js";

// EDHREC rank 14369. The granted untap is the enchanted creature's own
// ability (Dragon Mantle's shape), activated by that creature's controller.

const ENTER_TEXT = "When this Aura enters, tap enchanted creature.";
const UNTAP_TEXT = "Enchanted creature doesn't untap during its controller's untap step.";
const GRANTED_TEXT = "{5}: Untap this creature.";

export default defineCard({
  name: "Ringing Strike Mastery",
  manaCost: "{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${ENTER_TEXT}\n${UNTAP_TEXT}\nEnchanted creature has "${GRANTED_TEXT}"`,
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
          cost: { mana: "{5}", tap: false },
          targets: [],
          effect: { kind: "untap", target: "source" },
          resolve: null,
          text: GRANTED_TEXT,
        },
      ],
      text: `Enchanted creature has "${GRANTED_TEXT}"`,
    },
  ],
});
