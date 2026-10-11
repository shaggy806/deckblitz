import { defineCard } from "../define.js";
import { eternalizeAbility } from "../helpers.js";

// EDHREC rank 6825.
//
// Eternalize (rule 702.129) is `eternalizeAbility`: a 4/4 black Zombie Cat
// copy with no mana cost, which keeps double strike.
const ETERNALIZE_TEXT =
  "Eternalize {3}{W}{W} ({3}{W}{W}, Exile this card from your graveyard: Create a token that's a " +
  "copy of it, except it's a 4/4 black Zombie Cat with no mana cost. Eternalize only as a sorcery.)";

export default defineCard({
  name: "Adorned Pouncer",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Cat"],
  power: 1,
  toughness: 1,
  keywords: ["double-strike"],
  text: `Double strike\n${ETERNALIZE_TEXT}`,
  activated: [eternalizeAbility("{3}{W}{W}", ETERNALIZE_TEXT)],
});
