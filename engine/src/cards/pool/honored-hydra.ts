import { defineCard } from "../define.js";
import { embalmAbility } from "../helpers.js";

// EDHREC rank 17962. Amonkhet.
const EMBALM_TEXT =
  "Embalm {3}{G} ({3}{G}, Exile this card from your graveyard: Create a token that's a copy of it, except it's a white Zombie Snake Hydra with no mana cost. Embalm only as a sorcery.)";

export default defineCard({
  name: "Honored Hydra",
  manaCost: "{5}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Snake", "Hydra"],
  power: 6,
  toughness: 6,
  keywords: ["trample"],
  text: `Trample\n${EMBALM_TEXT}`,
  activated: [embalmAbility("{3}{G}", EMBALM_TEXT)],
});
