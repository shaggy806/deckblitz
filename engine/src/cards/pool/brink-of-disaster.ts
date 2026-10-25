import { defineCard } from "../define.js";

// Worldwake (WWK). EDHREC rank 24711.
//
// Blight's shape, enchanting a creature or a land. "Destroy it" is the
// permanent that became tapped (the trigger object), so it's destroyed even
// if Brink of Disaster has left by then (the rulings).
const TEXT = "When enchanted permanent becomes tapped, destroy it.";

export default defineCard({
  name: "Brink of Disaster",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature or land\n${TEXT}`,
  targets: [{ kind: "permanent", filter: { typesAnyOf: ["creature", "land"] } }],
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
