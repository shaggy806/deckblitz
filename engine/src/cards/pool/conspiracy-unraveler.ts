import { defineCard } from "../define.js";

// EDHREC rank 13438.
//
// Rulings:
//   - Casting a spell from your graveyard, you can't exile that card to pay it.
//   - Cast "rather than pay its mana cost", no other alternative cost goes with
//     it; additional costs are still paid, and beside a spell's own "collect
//     evidence" both are paid ("whenever you collect evidence" triggers twice).
//   - With too little mana value in the graveyard it can't be chosen at all.
//   - X is 0. "If evidence was collected" reads only the spell's own cost.
//
// - Jodah, Archmage Eternal's `alternativeCostForSpells` with `collectEvidence`
//   (rule 701.59a): `mana: "{0}"`, the cards exiled chosen as the cost is paid,
//   the spell on the stack (601.2h), and offered only while the graveyard holds
//   total mana value 10 besides the spell (701.59b).
const TEXT =
  "You may collect evidence 10 rather than pay the mana cost for spells you cast. (To collect evidence 10, exile cards with total mana value 10 or greater from your graveyard.)";

export default defineCard({
  name: "Conspiracy Unraveler",
  manaCost: "{5}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Sphinx", "Detective"],
  power: 6,
  toughness: 6,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  static: [{ affects: { scope: "self" }, alternativeCostForSpells: { mana: "{0}", collectEvidence: 10 }, text: TEXT }],
});
