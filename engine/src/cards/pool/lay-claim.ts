import { defineCard } from "../define.js";

// EDHREC rank 17304. Amonkhet. Mind Control over any permanent. The Auras
// and Equipment on what it takes stay with their own controllers (the
// ruling).
export default defineCard({
  name: "Lay Claim",
  manaCost: "{5}{U}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant permanent\nYou control enchanted permanent.\nCycling {2} ({2}, Discard this card: Draw a card.)",
  targets: ["permanent"],
  controlEnchanted: true,
  cycling: { cost: "{2}" },
});
