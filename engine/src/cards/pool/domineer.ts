import { defineCard } from "../define.js";

// Mirrodin (MRD). EDHREC rank 29457.
//
// Enchant artifact creature: it falls off once the permanent stops being either
// (the ruling; rule 303.4d).

export default defineCard({
  name: "Domineer",
  manaCost: "{1}{U}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant artifact creature\nYou control enchanted artifact creature.",
  targets: [{ kind: "permanent", filter: { types: ["artifact", "creature"] } }],
  controlEnchanted: true,
});
