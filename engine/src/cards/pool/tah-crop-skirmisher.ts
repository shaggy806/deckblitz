import { defineCard } from "../define.js";
import { embalmAbility } from "../helpers.js";

// Amonkhet.
const EMBALM_TEXT =
  "Embalm {3}{U} ({3}{U}, Exile this card from your graveyard: Create a token that's a copy of it, except it's a white Zombie Snake Warrior with no mana cost. Embalm only as a sorcery.)";

export default defineCard({
  name: "Tah-Crop Skirmisher",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Snake", "Warrior"],
  power: 2,
  toughness: 1,
  text: EMBALM_TEXT,
  activated: [embalmAbility("{3}{U}", EMBALM_TEXT)],
});
