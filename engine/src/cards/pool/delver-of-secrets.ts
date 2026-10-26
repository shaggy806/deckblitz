import { defineCard } from "../define.js";

// EDHREC rank 16218.
//
// Rulings:
//   [2011-09-22] You may reveal the card even if it's not an instant or sorcery. Whether or not
//     you reveal it, the card stays on top of your library.
//
// Runo Stromkirk's shape: revealing a card that isn't an instant or sorcery
// does nothing, so the choice offered is to reveal a matching one or not.

const UPKEEP_TEXT =
  "At the beginning of your upkeep, look at the top card of your library. You may reveal that card. If an instant or sorcery card is revealed this way, transform this creature.";

export default defineCard({
  name: "Delver of Secrets",
  manaCost: "{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 1,
  toughness: 1,
  text: UPKEEP_TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 1,
        reveal: "chosen",
        min: 0,
        max: 1,
        filter: { typesAnyOf: ["instant", "sorcery"] },
        destination: "library-top",
        leftover: "stay",
        then: { kind: "transform", target: "source" },
      },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
  faces: ["Delver of Secrets", "Insectile Aberration"],
  transform: true,
});
