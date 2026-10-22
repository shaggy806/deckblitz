import { defineCard } from "../define.js";
import { embalmAbility } from "../helpers.js";

// Amonkhet.
const EMBALM_TEXT =
  "Embalm {3}{W}{W} ({3}{W}{W}, Exile this card from your graveyard: Create a token that's a copy of it, except it's a white Zombie Bird Soldier with no mana cost. Embalm only as a sorcery.)";

export default defineCard({
  name: "Oketra's Attendant",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Bird", "Soldier"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  cycling: { cost: "{2}" },
  text: `Flying\nCycling {2} ({2}, Discard this card: Draw a card.)\n${EMBALM_TEXT}`,
  activated: [embalmAbility("{3}{W}{W}", EMBALM_TEXT)],
});
