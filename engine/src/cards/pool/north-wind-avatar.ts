import { defineCard } from "../define.js";

const TEXT = "When this creature enters, if you cast it, you may put a card you own from outside the game into your hand.";

export default defineCard({
  name: "North Wind Avatar",
  manaCost: "{2}{U}{U}{R}",
  colors: ["U", "R"],
  types: ["creature"],
  subtypes: ["Dragon", "Spirit", "Avatar"],
  power: 5,
  toughness: 5,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "source", filter: { castBy: "you" } },
      targets: [],
      effect: { kind: "search-library", filter: {}, destination: "hand", min: 0, max: 1, outside: "only" },
      resolve: null,
      text: TEXT,
    },
  ],
});
