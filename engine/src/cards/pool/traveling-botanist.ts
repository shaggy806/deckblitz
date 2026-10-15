import { defineCard } from "../define.js";

// EDHREC rank 14709. Sarinth Steelseeker's look, on becoming tapped.

const TEXT =
  "Whenever this creature becomes tapped, look at the top card of your library. If it's a land card, you may reveal it and put it into your hand. If you don't put the card into your hand, you may put it into your graveyard.";

export default defineCard({
  name: "Traveling Botanist",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Dog", "Scout"],
  power: 2,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "becomes-tapped", who: "self" },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 1,
        reveal: "chosen",
        min: 0,
        max: 1,
        filter: { type: "land" },
        destination: "hand",
        secondPick: { min: 0, max: 1, destination: "graveyard" },
        leftover: "stay",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
