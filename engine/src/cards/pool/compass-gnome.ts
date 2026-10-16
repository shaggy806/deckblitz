import { defineCard } from "../define.js";

// EDHREC rank 16549.

export default defineCard({
  name: "Compass Gnome",
  manaCost: "{2}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Gnome"],
  power: 2,
  toughness: 1,
  text: "When this creature enters, you may search your library for a basic land card or Cave card, reveal it, then shuffle and put that card on top.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Search your library for a basic land card or Cave card?",
        effect: {
          kind: "search-library",
          filter: { anyOf: [{ supertype: "basic", type: "land" }, { subtype: "Cave" }] },
          destination: "library-top",
          reveal: true,
          min: 0,
          max: 1,
        },
      },
      resolve: null,
      text: "When this creature enters, you may search your library for a basic land card or Cave card, reveal it, then shuffle and put that card on top.",
    },
  ],
});
