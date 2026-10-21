import { defineCard } from "../define.js";

const LOCK = "As long as you control another snow permanent, enchanted creature doesn't untap during its controller's untap step.";

export default defineCard({
  name: "Winter's Rest",
  manaCost: "{1}{U}",
  colors: ["U"],
  supertypes: ["snow"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\nWhen this Aura enters, tap enchanted creature.\n${LOCK}`,
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "tap", target: "attached" },
      resolve: null,
      text: "When this Aura enters, tap enchanted creature.",
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      // A static's condition leaves its own permanent out: "another".
      condition: { kind: "controls", filter: { supertype: "snow" }, atLeast: 1 },
      restrictions: ["doesnt-untap"],
      text: LOCK,
    },
  ],
});
