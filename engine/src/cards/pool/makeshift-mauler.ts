import { defineCard } from "../define.js";

// EDHREC rank 26525. The Skaabs' additional cost (`additionalCost.exileFromGraveyard`):
// exactly 1, chosen as it's paid with the spell on the stack (601.2h).

export default defineCard({
  name: "Makeshift Mauler",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Zombie", "Horror"],
  power: 4,
  toughness: 5,
  text: "As an additional cost to cast this spell, exile a creature card from your graveyard.",
  additionalCost: { exileFromGraveyard: { count: 1, filter: { type: "creature" } } },
});
