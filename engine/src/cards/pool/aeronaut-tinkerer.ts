import { defineCard } from "../define.js";

// Magic 2015. EDHREC rank 27455.

const TEXT = "This creature has flying as long as you control an artifact.";

export default defineCard({
  name: "Aeronaut Tinkerer",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Artificer"],
  power: 2,
  toughness: 3,
  text: `${TEXT} (It can't be blocked except by creatures with flying or reach.)`,
  static: [
    {
      affects: { scope: "self" },
      // countsSelf: a copy of it that is an artifact counts itself.
      condition: { kind: "controls", filter: { type: "artifact" }, atLeast: 1, countsSelf: true },
      grantKeywords: ["flying"],
      text: TEXT,
    },
  ],
});
