import { defineCard } from "../define.js";

// EDHREC rank 15406.

export default defineCard({
  name: "Suntouched Myr",
  manaCost: "{3}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Myr"],
  power: 0,
  toughness: 0,
  text: "Sunburst (This creature enters with a +1/+1 counter on it for each color of mana spent to cast it.)",
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", sunburst: true },
      text: "Sunburst (This creature enters with a +1/+1 counter on it for each color of mana spent to cast it.)",
    },
  ],
});
