import { defineCard } from "../define.js";

// EDHREC rank 31238. Coiling Oracle's shape: the one revealed card goes to
// hand if it's an artifact card, otherwise to the graveyard.

const TEXT =
  "When this creature enters, reveal the top card of your library. If it's an artifact card, put it into your hand. Otherwise, put it into your graveyard.";

export default defineCard({
  name: "Neurok Familiar",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Bird"],
  power: 1,
  toughness: 1,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 1,
        reveal: true,
        min: 1,
        max: 1,
        filter: { type: "artifact" },
        destination: "hand",
        leftover: "graveyard",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
