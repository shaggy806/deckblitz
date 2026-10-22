import { defineCard } from "../define.js";
import { embalmAbility } from "../helpers.js";

// Amonkhet. EDHREC rank 28628.

const EMBALM_TEXT =
  "Embalm {4}{W} ({4}{W}, Exile this card from your graveyard: Create a token that's a copy of it, except it's a white Zombie Human Warrior with no mana cost. Embalm only as a sorcery.)";

export default defineCard({
  name: "Unwavering Initiate",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 3,
  toughness: 2,
  keywords: ["vigilance"],
  text: `Vigilance\n${EMBALM_TEXT}`,
  activated: [embalmAbility("{4}{W}", EMBALM_TEXT)],
});
