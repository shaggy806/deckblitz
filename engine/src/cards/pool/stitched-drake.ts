import { defineCard } from "../define.js";

// EDHREC rank 26813. The Skaabs' additional cost (`additionalCost.exileFromGraveyard`):
// exactly 1, chosen as it's paid with the spell on the stack (601.2h).

export default defineCard({
  name: "Stitched Drake",
  manaCost: "{1}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Zombie", "Drake"],
  power: 3,
  toughness: 4,
  keywords: ["flying"],
  text: "As an additional cost to cast this spell, exile a creature card from your graveyard.\nFlying",
  additionalCost: { exileFromGraveyard: { count: 1, filter: { type: "creature" } } },
});
