import { defineCard } from "../define.js";

// EDHREC rank 23858.
//
// Rulings:
//   The restriction that the permanent must be tapped is checked only if you cast Dream Leash as a
//     spell. Once Dream Leash is on the battlefield, it doesn't matter if the enchanted permanent
//     becomes untapped.
//   If an effect puts Dream Leash onto the battlefield or moves it to another permanent, the
//     permanent it becomes attached to need not be tapped.

export default defineCard({
  name: "Dream Leash",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text:
    "Enchant permanent\nYou can't choose an untapped permanent as this spell's target as you cast it.\nYou control enchanted permanent.",
  // The enchant ability is "permanent"; the tapped requirement is only the
  // cast's choice (`asChosen`), so neither resolution nor the enchant
  // ability reads it (the rulings).
  targets: [{ kind: "permanent", filter: {}, asChosen: { tapped: true } }],
  controlEnchanted: true,
});
