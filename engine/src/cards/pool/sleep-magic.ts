import { defineCard } from "../define.js";

const ENTER = "When this Aura enters, tap enchanted creature.";
const LOCK = "Enchanted creature doesn't untap during its controller's untap step.";
const DAMAGE = "When enchanted creature is dealt damage, sacrifice this Aura.";

export default defineCard({
  name: "Sleep Magic",
  manaCost: "{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${ENTER}\n${LOCK}\n${DAMAGE}`,
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "tap", target: "attached" },
      resolve: null,
      text: ENTER,
    },
    {
      trigger: { on: "dealt-damage", who: "attached" },
      targets: [],
      effect: { kind: "sacrifice-source" },
      resolve: null,
      text: DAMAGE,
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
