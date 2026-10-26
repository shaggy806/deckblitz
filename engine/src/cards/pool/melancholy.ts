import { defineCard } from "../define.js";

// Planar Chaos (PLC). Bitter Chill's tap and lock with Earthlink's upkeep.
const ENTER = "When this Aura enters, tap enchanted creature.";
const LOCK = "Enchanted creature doesn't untap during its controller's untap step.";
const UPKEEP = "At the beginning of your upkeep, sacrifice this Aura unless you pay {B}.";

export default defineCard({
  name: "Melancholy",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${ENTER}\n${LOCK}\n${UPKEEP}`,
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
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "unless",
        chooser: "you",
        options: [{ pay: "{B}", text: "Pay {B}" }],
        otherwise: { kind: "sacrifice-source" },
      },
      resolve: null,
      text: UPKEEP,
    },
  ],
  static: [{ affects: { scope: "attached" }, restrictions: ["doesnt-untap"], text: LOCK }],
});
