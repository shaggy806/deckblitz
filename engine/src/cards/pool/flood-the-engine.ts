import { defineCard } from "../define.js";

// EDHREC rank 15807.
//
// Malfunction's enters trigger, and a `loseAllAbilities` static whose own
// "doesn't untap" stays (rule 613.7).

const TAP_TEXT = "When this Aura enters, tap enchanted permanent.";
const LOCK_TEXT = "Enchanted permanent loses all abilities and doesn't untap during its controller's untap step.";

export default defineCard({
  name: "Flood the Engine",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature or Vehicle\n${TAP_TEXT}\n${LOCK_TEXT}`,
  targets: [{ kind: "permanent", filter: { anyOf: [{ type: "creature" }, { subtype: "Vehicle" }] } }],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "tap", target: "attached" },
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
