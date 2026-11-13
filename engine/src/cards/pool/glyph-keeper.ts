import { defineCard } from "../define.js";
import { embalmAbility } from "../helpers.js";

// EDHREC rank 20864. Amonkhet. Kira, Great Glass-Spinner's granted trigger,
// printed; embalm is `embalmAbility` (the token is a copy, Aven Wind Guide).
const COUNTER =
  "Whenever this creature becomes the target of a spell or ability for the first time each turn, counter that spell or ability.";
const EMBALM =
  "Embalm {5}{U}{U} ({5}{U}{U}, Exile this card from your graveyard: Create a token that's a copy of it, except it's a white Zombie Sphinx with no mana cost. Embalm only as a sorcery.)";

export default defineCard({
  name: "Glyph Keeper",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Sphinx"],
  power: 5,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${COUNTER}\n${EMBALM}`,
  triggered: [
    {
      trigger: { on: "becomes-target", who: "self", firstTimeEachTurn: true },
      targets: [],
      effect: { kind: "ward", cost: null },
      resolve: null,
      text: COUNTER,
    },
  ],
  activated: [embalmAbility("{5}{U}{U}", EMBALM)],
});
