import { defineCard } from "../define.js";

// Control Magic's `controlEnchanted`, with a "doesn't untap" restriction on
// the enchanted permanent (rule 502.3) and an enters trigger tapping it
// (`"attached"`).
const ENTERS = "When this Aura enters, tap enchanted permanent.";
const LOCK = "Enchanted permanent doesn't untap during its controller's untap step.";

export default defineCard({
  name: "Tractor Beam",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature or Spacecraft\n${ENTERS}\nYou control enchanted permanent.\n${LOCK}`,
  targets: [{ kind: "permanent", filter: { anyOf: [{ type: "creature" }, { subtype: "Spacecraft" }] } }],
  controlEnchanted: true,
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
