import { defineCard } from "../define.js";

const TEXT =
  "When this creature enters, you may search your library for a Goblin card, reveal it, then shuffle and put that card on top.";

export default defineCard({
  name: "Boggart Harbinger",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Goblin", "Shaman"],
  power: 2,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Search your library for a Goblin card?",
        effect: {
          kind: "search-library",
          filter: { subtype: "Goblin" },
          destination: "library-top",
          reveal: true,
          min: 0,
          max: 1,
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
