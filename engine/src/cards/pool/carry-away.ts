import { defineCard } from "../define.js";

// Ruling (2004-12-01): gaining control of an Equipment doesn't move it, so the
// enters trigger unattaches it; its new controller may then equip it.

export default defineCard({
  name: "Carry Away",
  manaCost: "{U}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant Equipment\nWhen this Aura enters, unattach enchanted Equipment.\nYou control enchanted Equipment.",
  targets: [{ kind: "permanent", filter: { subtype: "Equipment" } }],
  controlEnchanted: true,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "unattach", target: "attached" },
      resolve: null,
      text: "When this Aura enters, unattach enchanted Equipment.",
    },
  ],
});
