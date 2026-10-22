import { defineCard } from "../define.js";
import { embalmAbility } from "../helpers.js";

// Amonkhet.
const EMBALM_TEXT =
  "Embalm {6}{U} ({6}{U}, Exile this card from your graveyard: Create a token that's a copy of it, except it's a white Zombie Bird Warrior with no mana cost. Embalm only as a sorcery.)";

export default defineCard({
  name: "Aven Initiate",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Bird", "Warrior"],
  power: 3,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${EMBALM_TEXT}`,
  activated: [embalmAbility("{6}{U}", EMBALM_TEXT)],
});
