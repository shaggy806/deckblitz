import { defineCard } from "../define.js";

// Rulings:
//   [2004-10-04] It only triggers if the land becomes tapped after this Aura is on it.

const TEXT = "When enchanted land becomes tapped, destroy it.";

export default defineCard({
  name: "Uncontrolled Infestation",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant nonbasic land\n${TEXT}`,
  targets: [{ kind: "permanent", filter: { type: "land", notSupertype: "basic" } }],
  triggered: [
    {
      trigger: { on: "becomes-tapped", who: "attached" },
      targets: [],
      effect: { kind: "destroy", target: "trigger-object" },
      resolve: null,
      text: TEXT,
    },
  ],
});
