import { defineCard } from "../define.js";

const EXPLORE = "When this creature dies, each player may search their library for up to two basic land cards, put them onto the battlefield, then shuffle.";

// Urza's Legacy (ULG). EDHREC rank 6162.
export default defineCard({
  name: "Veteran Explorer",
  manaCost: "{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Soldier", "Scout"],
  power: 1,
  toughness: 1,
  text: EXPLORE,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "each-player",
        prompt: "Search your library for up to two basic land cards?",
        effect: { kind: "search-library", filter: { type: "land", supertype: "basic" }, destination: "battlefield", min: 0, max: 2 },
      },
      resolve: null,
      text: EXPLORE,
    },
  ],
});
