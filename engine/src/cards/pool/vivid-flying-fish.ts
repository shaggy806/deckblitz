import { defineCard } from "../define.js";

// EDHREC rank 27375. Kitesail Corsair's static.
const TEXT = "This creature has flying as long as it's attacking. (It can't be blocked except by creatures with flying or reach.)";

export default defineCard({
  name: "Vivid Flying Fish",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Fish", "Lizard"],
  power: 1,
  toughness: 1,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "source", filter: { attacking: true } },
      grantKeywords: ["flying"],
      text: TEXT,
    },
  ],
});
