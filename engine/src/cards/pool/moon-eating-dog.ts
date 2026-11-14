import { defineCard } from "../define.js";

// EDHREC rank 31836.

const FLYING_TEXT = "As long as you control a Yanling planeswalker, this creature has flying.";

export default defineCard({
  name: "Moon-Eating Dog",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Dog"],
  power: 3,
  toughness: 3,
  text: `${FLYING_TEXT} (It can't be blocked except by creatures with flying or reach.)`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "controls", filter: { type: "planeswalker", subtype: "Yanling" }, atLeast: 1 },
      grantKeywords: ["flying"],
      text: FLYING_TEXT,
    },
  ],
});
