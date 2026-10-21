import { defineCard } from "../define.js";

const UNTAP_TEXT = "When this Aura enters, untap enchanted permanent.";
const PUMP_TEXT = "Enchanted permanent gets +1/+2 and has reach.";

export default defineCard({
  name: "Silken Strength",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  keywords: ["flash"],
  text: `Flash\nEnchant creature or Vehicle\n${UNTAP_TEXT}\n${PUMP_TEXT}`,
  targets: [{ kind: "permanent", filter: { anyOf: [{ type: "creature" }, { subtype: "Vehicle" }] } }],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "untap", target: "attached" },
      resolve: null,
      text: UNTAP_TEXT,
    },
  ],
  static: [{ affects: { scope: "attached" }, grantPt: [1, 2], grantKeywords: ["reach"], text: PUMP_TEXT }],
});
