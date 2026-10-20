import { defineCard } from "../define.js";
import { eternalizeAbility } from "../helpers.js";

// Plainscycling is typecycling (`cycling.search` — it
// searches, it doesn't draw); eternalize (rule 702.129) is
// `eternalizeAbility`: a 4/4 black Zombie Dragon copy with no mana cost,
// flying kept.
const PLAINSCYCLING_TEXT =
  "Plainscycling {2} ({2}, Discard this card: Search your library for a Plains card, reveal it, put it into your hand, then shuffle.)";
const ETERNALIZE_TEXT =
  "Eternalize {2}{W}{W} ({2}{W}{W}, Exile this card from your graveyard: Create a token that's a copy of it, except it's a 4/4 black Zombie Dragon with no mana cost. Eternalize only as a sorcery.)";

export default defineCard({
  name: "Timeless Dragon",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Dragon"],
  power: 5,
  toughness: 5,
  keywords: ["flying"],
  cycling: { cost: "{2}", search: { subtype: "Plains" } },
  text: `Flying\n${PLAINSCYCLING_TEXT}\n${ETERNALIZE_TEXT}`,
  activated: [eternalizeAbility("{2}{W}{W}", ETERNALIZE_TEXT)],
});
