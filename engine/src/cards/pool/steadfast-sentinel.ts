import { defineCard } from "../define.js";
import { eternalizeAbility } from "../helpers.js";

// EDHREC rank 29083.
//
// Eternalize (rule 702.129) is `eternalizeAbility`: a 4/4 black Zombie Human Cleric copy with no
// mana cost, which keeps vigilance.
const ETERNALIZE_TEXT =
  "Eternalize {4}{W}{W} ({4}{W}{W}, Exile this card from your graveyard: Create a token that's a " +
  "copy of it, except it's a 4/4 black Zombie Human Cleric with no mana cost. Eternalize only as a sorcery.)";

export default defineCard({
  name: "Steadfast Sentinel",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 2,
  toughness: 3,
  keywords: ["vigilance"],
  text: `Vigilance\n${ETERNALIZE_TEXT}`,
  activated: [eternalizeAbility("{4}{W}{W}", ETERNALIZE_TEXT)],
});
