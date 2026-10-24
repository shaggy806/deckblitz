import { defineCard } from "../define.js";

// EDHREC rank 22725. With its target gone illegal it doesn't resolve, so it
// never enters and gives no energy (the ruling).
const ENTER = "When this Aura enters, you get {E}{E} (two energy counters).";
const MINUS = "Enchanted creature gets -4/-0.";

export default defineCard({
  name: "Aether Meltdown",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  keywords: ["flash"],
  text: `Flash (You may cast this spell any time you could cast an instant.)\nEnchant creature or Vehicle\n${ENTER}\n${MINUS}`,
  targets: [{ kind: "permanent", filter: { anyOf: [{ type: "creature" }, { subtype: "Vehicle" }] } }],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "get-energy", amount: 2 },
      resolve: null,
      text: ENTER,
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [-4, 0],
      text: MINUS,
    },
  ],
});
