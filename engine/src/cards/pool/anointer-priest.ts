import { defineCard } from "../define.js";
import { embalmAbility } from "../helpers.js";

// EDHREC rank 11501. Amonkhet. Its embalmed copy has the trigger too, and
// sees itself enter (a creature token you control).
const TOKEN_TEXT = "Whenever a creature token you control enters, you gain 1 life.";
const EMBALM_TEXT =
  "Embalm {3}{W} ({3}{W}, Exile this card from your graveyard: Create a token that's a copy of it, except it's a white Zombie Human Cleric with no mana cost. Embalm only as a sorcery.)";

export default defineCard({
  name: "Anointer Priest",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 1,
  toughness: 3,
  text: `${TOKEN_TEXT}\n${EMBALM_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "creature", token: true } },
      targets: [],
      effect: { kind: "gain-life", amount: 1 },
      resolve: null,
      text: TOKEN_TEXT,
    },
  ],
  activated: [embalmAbility("{3}{W}", EMBALM_TEXT)],
});
