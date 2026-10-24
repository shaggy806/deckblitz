import { defineCard } from "../define.js";

// EDHREC rank 7598.
const DIES_TEXT =
  "When this creature dies, you may search your library for up to three Forest cards, put them onto the battlefield tapped, then shuffle.";

export default defineCard({
  name: "Seedguide Ash",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Treefolk", "Druid"],
  power: 4,
  toughness: 4,
  text: DIES_TEXT,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Search your library for up to three Forest cards?",
        effect: {
          kind: "search-library",
          filter: { type: "land", subtype: "Forest" },
          destination: "battlefield",
          min: 0,
          max: 3,
          enterTapped: true,
        },
      },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
