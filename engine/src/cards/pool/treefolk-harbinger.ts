import { defineCard } from "../define.js";

const TEXT =
  "When this creature enters, you may search your library for a Treefolk or Forest card, reveal it, then shuffle and put that card on top.";

export default defineCard({
  name: "Treefolk Harbinger",
  manaCost: "{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Treefolk", "Druid"],
  power: 0,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Search your library for a Treefolk or Forest card?",
        effect: {
          kind: "search-library",
          filter: { subtypes: ["Treefolk", "Forest"] },
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
