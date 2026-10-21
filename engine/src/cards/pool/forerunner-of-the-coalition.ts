import { defineCard } from "../define.js";

// EDHREC rank 7646. Rivals of Ixalan.
//
// Campus Guide's optional tutor-to-top, for a Pirate card (a card with the
// subtype — its ruling), and Corpse Knight's drain for another Pirate.

export default defineCard({
  name: "Forerunner of the Coalition",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Pirate"],
  power: 2,
  toughness: 2,
  text: "When this creature enters, you may search your library for a Pirate card, reveal it, then shuffle and put that card on top.\nWhenever another Pirate you control enters, each opponent loses 1 life.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Search your library for a Pirate card?",
        effect: {
          kind: "search-library",
          filter: { subtype: "Pirate" },
          destination: "library-top",
          reveal: true,
          min: 0,
          max: 1,
        },
      },
      resolve: null,
      text: "When this creature enters, you may search your library for a Pirate card, reveal it, then shuffle and put that card on top.",
    },
    {
      trigger: {
        on: "enters-battlefield",
        who: "you-control",
        filter: { subtype: "Pirate" },
        otherOnly: true,
      },
      targets: [],
      effect: { kind: "lose-life", amount: 1, who: "each-opponent" },
      resolve: null,
      text: "Whenever another Pirate you control enters, each opponent loses 1 life.",
    },
  ],
});
