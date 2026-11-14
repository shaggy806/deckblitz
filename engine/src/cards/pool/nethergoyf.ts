import { defineCard } from "../define.js";

// A characteristic-defining ability (rule 604.3), so it applies in every zone:
// Consuming Blob's count, its owner's graveyard alone.
const PT_TEXT =
  "Nethergoyf's power is equal to the number of card types among cards in your graveyard and its " +
  "toughness is equal to that number plus 1.";
const ESCAPE_TEXT =
  "Escape—{2}{B}, Exile any number of other cards from your graveyard with four or more card types " +
  "among them. (You may cast this card from your graveyard for its escape cost.)";

// The escape's exile is `exileTypesAmong`: any number of other cards whose
// card types number four or more, chosen once it's on the stack (rule 601.2h).
export default defineCard({
  name: "Nethergoyf",
  manaCost: "{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Lhurgoyf"],
  power: 0,
  toughness: 1,
  text: `${PT_TEXT}\n${ESCAPE_TEXT}`,
  escape: { cost: "{2}{B}", exileCount: 0, exileTypesAmong: 4 },
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: { countOf: { cardTypesInGraveyard: { ownedBy: "you" } }, plusPower: 0, plusToughness: 1 },
      text: PT_TEXT,
    },
  ],
});
