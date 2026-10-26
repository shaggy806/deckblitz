import { defineCard } from "../define.js";

export default defineCard({
  name: "Giant Harbinger",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Giant", "Shaman"],
  power: 3,
  toughness: 4,
  text: "When this creature enters, you may search your library for a Giant card, reveal it, then shuffle and put that card on top.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Search your library for a Giant card?",
        effect: {
          kind: "search-library",
          filter: { subtype: "Giant" },
          destination: "library-top",
          reveal: true,
          min: 0,
          max: 1,
        },
      },
      resolve: null,
      text: "When this creature enters, you may search your library for a Giant card, reveal it, then shuffle and put that card on top.",
    },
  ],
});
