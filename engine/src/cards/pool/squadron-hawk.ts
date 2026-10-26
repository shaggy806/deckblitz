import { defineCard } from "../define.js";

const TEXT =
  "When this creature enters, you may search your library for up to three cards named Squadron Hawk, reveal them, put them into your hand, then shuffle.";

export default defineCard({
  name: "Squadron Hawk",
  manaCost: "{1}{W}",
  colors: ["W"],
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
        kind: "may",
        prompt: "Search your library for up to three cards named Squadron Hawk?",
        effect: {
          kind: "search-library",
          filter: { name: "Squadron Hawk" },
          destination: "hand",
          reveal: true,
          min: 0,
          max: 3,
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
