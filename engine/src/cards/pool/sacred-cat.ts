import { defineCard } from "../define.js";
import { embalmAbility } from "../helpers.js";

// EDHREC rank 8339. Amonkhet. Embalm (rule 702.128a) is `embalmAbility`: a
// white Zombie Cat copy with no mana cost, lifelink and all.
const EMBALM_TEXT =
  "Embalm {W} ({W}, Exile this card from your graveyard: Create a token that's a copy of it, except it's a white Zombie Cat with no mana cost. Embalm only as a sorcery.)";

export default defineCard({
  name: "Sacred Cat",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Cat"],
  power: 1,
  toughness: 1,
  keywords: ["lifelink"],
  text: `Lifelink\n${EMBALM_TEXT}`,
  activated: [embalmAbility("{W}", EMBALM_TEXT)],
});
