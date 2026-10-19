import { defineCard } from "../define.js";

// EDHREC rank 18952.

const TEXT = "When this creature enters, tap target creature an opponent controls. Goad it.";

export default defineCard({
  name: "Oceanus Dragon",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Dragon"],
  power: 3,
  toughness: 5,
  keywords: ["flying"],
  text: `Flying\n${TEXT} (Until your next turn, that creature attacks each combat if able and attacks a player other than you if able.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-an-opponent-controls"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "tap", target: 0 },
          { kind: "goad", target: 0 },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
