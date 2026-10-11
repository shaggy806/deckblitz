import { defineCard } from "../define.js";

// EDHREC rank 17014. Reality Fracture.
//
// Cool but Rude's level-3 shape: the search shuffles, then the random discard
// comes out of the hand the found card just joined.

const ENTER_TEXT =
  "When this creature enters, search your library for a card, put it into your hand, shuffle, then discard a card at random.";

export default defineCard({
  name: "Curse-Marred Demon",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Demon"],
  power: 4,
  toughness: 4,
  keywords: ["flying", "trample"],
  text: `Flying, trample\n${ENTER_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "search-library", filter: {}, destination: "hand", min: 1, max: 1 },
          { kind: "discard", target: "you", amount: 1, random: true },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
