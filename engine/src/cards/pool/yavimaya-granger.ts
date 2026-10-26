import { defineCard } from "../define.js";

// EDHREC rank 17398.
//
// Rulings:
//   [2004-10-04] Because the "search" requires you to find a card with certain characteristics,
//     you don't have to find the card if you don't want to.

const ECHO_TEXT =
  "Echo {2}{G} (At the beginning of your upkeep, if this came under your control since the beginning of your last upkeep, sacrifice it unless you pay its echo cost.)";
const ENTERS_TEXT =
  "When this creature enters, you may search your library for a basic land card, put that card onto the battlefield tapped, then shuffle.";

export default defineCard({
  name: "Yavimaya Granger",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf"],
  power: 2,
  toughness: 2,
  text: `${ECHO_TEXT}\n${ENTERS_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      condition: { kind: "source-came-under-control-since-last-upkeep" },
      targets: [],
      effect: {
        kind: "unless",
        chooser: "you",
        options: [{ pay: "{2}{G}", text: "Pay {2}{G}" }],
        otherwise: { kind: "sacrifice-source" },
      },
      resolve: null,
      text: ECHO_TEXT,
    },
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Search your library for a basic land card?",
        effect: {
          kind: "search-library",
          filter: { type: "land", supertype: "basic" },
          destination: "battlefield",
          min: 0,
          max: 1,
          enterTapped: true,
        },
      },
      resolve: null,
      text: ENTERS_TEXT,
    },
  ],
});
