import { defineCard } from "../define.js";

// Odyssey (ODY). EDHREC rank 18938. Hell Mongrel's discard pump and Psychic
// Frog's graveyard-exile cost.

const DISCARD_TEXT = "Discard a card: This creature gets +1/+1 until end of turn.";
const EXILE_TEXT = "Exile two cards from your graveyard: This creature gets +1/+1 until end of turn.";

export default defineCard({
  name: "Psychatog",
  manaCost: "{1}{U}{B}",
  colors: ["U", "B"],
  types: ["creature"],
  subtypes: ["Atog"],
  power: 1,
  toughness: 2,
  text: `${DISCARD_TEXT}\n${EXILE_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: false, discard: { count: 1 } },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: DISCARD_TEXT,
    },
    {
      cost: { mana: null, tap: false, exileFromGraveyard: { count: 2 } },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: EXILE_TEXT,
    },
  ],
});
