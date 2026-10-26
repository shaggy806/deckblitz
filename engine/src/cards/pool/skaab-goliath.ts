import { defineCard } from "../define.js";

// EDHREC rank 24263. The Skaabs' additional cost (`additionalCost.exileFromGraveyard`):
// exactly 2, chosen as it's paid with the spell on the stack (601.2h).

export default defineCard({
  name: "Skaab Goliath",
  manaCost: "{5}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Zombie", "Giant"],
  power: 6,
  toughness: 9,
  keywords: ["trample"],
  text: "As an additional cost to cast this spell, exile two creature cards from your graveyard.\nTrample",
  additionalCost: { exileFromGraveyard: { count: 2, filter: { type: "creature" } } },
});
