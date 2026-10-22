import { defineCard } from "../define.js";
import { embalmAbility } from "../helpers.js";

// EDHREC rank 9596. Amonkhet. Combine Chrysalis's token anthem with two
// keywords; embalm is `embalmAbility`.
const EMBALM_TEXT =
  "Embalm {4}{W}{U} ({4}{W}{U}, Exile this card from your graveyard: Create a token that's a copy of it, except it's a white Zombie Bird Warrior with no mana cost. Embalm only as a sorcery.)";
const TOKENS_TEXT = "Creature tokens you control have flying and vigilance.";

export default defineCard({
  name: "Aven Wind Guide",
  manaCost: "{2}{W}{U}",
  colors: ["W", "U"],
  types: ["creature"],
  subtypes: ["Bird", "Warrior"],
  power: 2,
  toughness: 3,
  keywords: ["flying", "vigilance"],
  text: `Flying, vigilance\n${TOKENS_TEXT}\n${EMBALM_TEXT}`,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", token: true, controlledBy: "you" } },
      grantKeywords: ["flying", "vigilance"],
      text: TOKENS_TEXT,
    },
  ],
  activated: [embalmAbility("{4}{W}{U}", EMBALM_TEXT)],
});
