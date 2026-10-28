import { defineCard } from "../define.js";

// EDHREC rank 23888.
//
// Clout of the Dominus's "as long as enchanted creature is red" condition, here on the
// loss of all abilities; the same condition is the enters trigger's intervening if.
//
// Rulings:
//   [2021-07-23] If the enchanted creature is red (or if it becomes red), it loses all abilities
//     that it had prior to the time Ray of Frost became attached to it. It will keep any abilities
//     that were granted to it after Ray of Frost became attached to it.
//   [2021-07-23] If the enchanted creature is red and has a characteristic-defining ability that
//     specifies its types or colors, that ability will still have its effect because it's applied
//     before the creature loses the ability.

const RED = { kind: "source", filter: { attachedTo: { colors: ["R"] } } } as const;
const TAP_TEXT = "When this Aura enters, if enchanted creature is red, tap it.";

export default defineCard({
  name: "Ray of Frost",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  keywords: ["flash"],
  text: `Flash\nEnchant creature\n${TAP_TEXT}\nAs long as enchanted creature is red, it loses all abilities.\nEnchanted creature doesn't untap during its controller's untap step.`,
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: RED,
      targets: [],
      effect: { kind: "tap", target: "attached" },
      resolve: null,
      text: TAP_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      condition: RED,
      loseAllAbilities: true,
      text: "As long as enchanted creature is red, it loses all abilities.",
    },
    {
      affects: { scope: "attached" },
      restrictions: ["doesnt-untap"],
      text: "Enchanted creature doesn't untap during its controller's untap step.",
    },
  ],
});
