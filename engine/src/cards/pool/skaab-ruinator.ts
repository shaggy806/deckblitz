import { defineCard } from "../define.js";

// EDHREC rank 17288. The Skaabs' additional cost (`additionalCost.exileFromGraveyard`):
// exactly 3, chosen as it's paid with the spell on the stack (601.2h).

export default defineCard({
  name: "Skaab Ruinator",
  manaCost: "{1}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Zombie", "Horror"],
  power: 5,
  toughness: 6,
  keywords: ["flying"],
  // "You may cast this card from your graveyard": Gravecrawler's permission
  // with no condition (Haakon's ALWAYS); the cost is paid from there too, and
  // the card is on the stack as it's paid, so it can't exile itself (the rulings).
  castFromGraveyardIf: { kind: "controls", filter: {}, atLeast: 0 },
  text: "As an additional cost to cast this spell, exile three creature cards from your graveyard.\nFlying\nYou may cast this card from your graveyard.",
  additionalCost: { exileFromGraveyard: { count: 3, filter: { type: "creature" } } },
});
