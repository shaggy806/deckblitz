import { defineCard } from "../define.js";

const ENTER = "When this Aura enters, if it was kicked, tap enchanted creature.";
const LOCK = "Enchanted creature doesn't untap during its controller's untap step.";

export default defineCard({
  name: "Bubble Snare",
  manaCost: "{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Kicker {2}{U} (You may pay an additional {2}{U} as you cast this spell.)\nEnchant creature\n${ENTER}\n${LOCK}`,
  kicker: { cost: "{2}{U}" },
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "self-kicked" },
      targets: [],
      effect: { kind: "tap", target: "attached" },
      resolve: null,
      text: ENTER,
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      restrictions: ["doesnt-untap"],
      text: LOCK,
    },
  ],
});
