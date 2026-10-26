import { defineCard } from "../define.js";
import { entersTappedStatic } from "../helpers.js";

// EDHREC rank 29139. The Skaabs' additional cost (`additionalCost.exileFromGraveyard`):
// exactly 1, chosen as it's paid with the spell on the stack (601.2h).

export default defineCard({
  name: "Headless Skaab",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Zombie", "Warrior"],
  power: 3,
  toughness: 6,
  static: [entersTappedStatic("Headless Skaab")],
  text: "As an additional cost to cast this spell, exile a creature card from your graveyard.\nThis creature enters tapped.",
  additionalCost: { exileFromGraveyard: { count: 1, filter: { type: "creature" } } },
});
