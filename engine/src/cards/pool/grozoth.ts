import { defineCard } from "../define.js";
import { transmute } from "../helpers.js";

const SEARCH =
  "When this creature enters, you may search your library for any number of cards that have mana value 9, reveal them, put them into your hand, then shuffle.";
const LOSE = "{4}: This creature loses defender until end of turn.";
const TRANSMUTE_TEXT =
  "Transmute {1}{U}{U} ({1}{U}{U}, Discard this card: Search your library for a card with the same mana value as this card, reveal it, put it into your hand, then shuffle. Transmute only as a sorcery.)";

export default defineCard({
  name: "Grozoth",
  manaCost: "{6}{U}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Leviathan"],
  power: 9,
  toughness: 9,
  keywords: ["defender"],
  text: `Defender (This creature can't attack.)\n${SEARCH}\n${LOSE}\n${TRANSMUTE_TEXT}`,
  activated: [
    {
      cost: { mana: "{4}", tap: false },
      targets: [],
      effect: { kind: "lose-keywords", target: "source", keywords: ["defender"], duration: "end-of-turn" },
      resolve: null,
      text: LOSE,
    },
    transmute("{1}{U}{U}", 9, TRANSMUTE_TEXT),
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Search your library for any number of cards with mana value 9?",
        effect: {
          kind: "search-library",
          filter: { manaValue: { op: "eq", n: 9 } },
          destination: "hand",
          reveal: true,
          min: 0,
          max: { librarySize: "you" },
        },
      },
      resolve: null,
      text: SEARCH,
    },
  ],
});
