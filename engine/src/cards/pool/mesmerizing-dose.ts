import { defineCard } from "../define.js";

// EDHREC rank 10095. Throne of Eldraine.

export default defineCard({
  name: "Mesmerizing Dose",
  manaCost: "{1}{U}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nWhen this Aura enters, tap enchanted creature, then proliferate. (Choose any number of permanents and/or players, then give each another counter of each kind already there.)\nEnchanted creature doesn't untap during its controller's untap step.",
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [{ kind: "tap", target: "attached" }, { kind: "proliferate" }],
      },
      resolve: null,
      text: "When this Aura enters, tap enchanted creature, then proliferate.",
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      restrictions: ["doesnt-untap"],
      text: "Enchanted creature doesn't untap during its controller's untap step.",
    },
  ],
});
