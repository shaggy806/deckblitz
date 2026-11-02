import { defineCard } from "../define.js";

const ENTERS = "When this Aura enters, tap enchanted creature. It deals damage to you equal to its power.";
const STAYS = "Enchanted creature doesn't untap during its controller's untap step.";

export default defineCard({
  name: "Bind the Monster",
  manaCost: "{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${ENTERS}\n${STAYS}`,
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "tap", target: "attached" },
          { kind: "damage", amount: { powerOf: "attached" }, who: "you", from: "attached" },
        ],
      },
      resolve: null,
      text: ENTERS,
    },
  ],
  static: [{ affects: { scope: "attached" }, restrictions: ["doesnt-untap"], text: STAYS }],
});
