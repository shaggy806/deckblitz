import { defineCard } from "../define.js";

// EDHREC rank 12427. The Lost Caverns of Ixalan.
//
// Rulings:
//   [2023-11-10] If there is only one card in your library, you put it into your hand.
//   [2023-11-10] The ability will trigger no matter what happened to the artifact after it
//     entered. It may have left the battlefield, come under another player's control, or stopped
//     being an artifact.
//
// Mechan Shieldmate's `turn-history` "entered" condition — each permanent is
// matched as it entered, under the controller it entered under, so the
// ruling's artifact that has since left, changed hands or stopped being an
// artifact still counts — as an intervening "if" on every player's end step;
// Sibsig Appraiser's look-two.

const TEXT =
  "At the beginning of each player's end step, if an artifact entered the battlefield under your control this turn, look at the top two cards of your library. Put one of them into your hand and the other into your graveyard.";

export default defineCard({
  name: "Akal Pakal, First Among Equals",
  manaCost: "{2}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Advisor"],
  power: 1,
  toughness: 5,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "any" },
      condition: { kind: "turn-history", what: "entered", filter: { type: "artifact" } },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 2,
        min: 1,
        max: 1,
        destination: "hand",
        leftover: "graveyard",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
