import { defineCard } from "../define.js";

const ENTERS = "When this Aura enters, tap enchanted permanent.";
const LOCK = "Enchanted permanent doesn't untap during its controller's untap step.";

// Tractor Beam's lock, without the control.
export default defineCard({
  name: "Malfunction",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant artifact or creature\n${ENTERS}\n${LOCK}`,
  targets: ["artifact-or-creature"],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "tap", target: "attached" },
      resolve: null,
      text: ENTERS,
    },
  ],
  static: [{ affects: { scope: "attached" }, restrictions: ["doesnt-untap"], text: LOCK }],
});
