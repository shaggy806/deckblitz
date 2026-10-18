import { defineCard } from "../define.js";

// EDHREC rank 10320.

export default defineCard({
  name: "Dune Mover",
  manaCost: "{2}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Phyrexian", "Golem"],
  power: 2,
  toughness: 1,
  toxic: 1,
  text: "Toxic 1 (Players dealt combat damage by this creature also get a poison counter.)\nWhen this creature enters, you may search your library for a basic land card, reveal it, then shuffle and put that card on top.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Search your library for a basic land card?",
        effect: {
          kind: "search-library",
          filter: { supertype: "basic", type: "land" },
          destination: "library-top",
          reveal: true,
          min: 0,
          max: 1,
        },
      },
      resolve: null,
      text: "When this creature enters, you may search your library for a basic land card, reveal it, then shuffle and put that card on top.",
    },
  ],
});
