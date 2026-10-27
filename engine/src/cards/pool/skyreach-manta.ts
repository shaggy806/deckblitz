import { defineCard } from "../define.js";

// EDHREC rank 25605.

export default defineCard({
  name: "Skyreach Manta",
  manaCost: "{5}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Fish"],
  power: 0,
  toughness: 0,
  keywords: ["flying"],
  text: "Sunburst (This creature enters with a +1/+1 counter on it for each color of mana spent to cast it.)\nFlying",
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", sunburst: true },
      text: "Sunburst (This creature enters with a +1/+1 counter on it for each color of mana spent to cast it.)",
    },
  ],
});
