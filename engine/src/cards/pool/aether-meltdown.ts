import { defineCard } from "../define.js";

// Kaladesh (KLD). EDHREC rank 22725.
//
// On an uncrewed Vehicle the -4/-0 changes nothing (rule 208.3).
export default defineCard({
  name: "Aether Meltdown",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  keywords: ["flash"],
  text: "Flash (You may cast this spell any time you could cast an instant.)\nEnchant creature or Vehicle\nWhen this Aura enters, you get {E}{E} (two energy counters).\nEnchanted creature gets -4/-0.",
  targets: [{ kind: "permanent", filter: { anyOf: [{ type: "creature" }, { subtype: "Vehicle" }] } }],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "get-energy", amount: 2 },
      resolve: null,
      text: "When this Aura enters, you get {E}{E} (two energy counters).",
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [-4, 0],
      text: "Enchanted creature gets -4/-0.",
    },
  ],
});
