import { defineCard } from "../define.js";

// "A card with a kicker ability" is `hasKicker`, read off the card's text.

const CAST_TEXT = "Whenever you cast a kicked spell, draw a card, then discard a card.";
const ENTER_TEXT =
  "When this creature enters, look at the top five cards of your library. You may reveal a card with a kicker ability from among them and put it into your hand. Put the rest on the bottom of your library in a random order.";

export default defineCard({
  name: "Coralhelm Chronicler",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Merfolk", "Wizard"],
  power: 2,
  toughness: 2,
  text: `${CAST_TEXT}\n${ENTER_TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { kicked: true } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          { kind: "discard", target: "you", amount: 1 },
        ],
      },
      resolve: null,
      text: CAST_TEXT,
    },
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 5,
        reveal: "chosen",
        min: 0,
        max: 1,
        filter: { hasKicker: true },
        destination: "hand",
        leftover: "bottom-random",
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
