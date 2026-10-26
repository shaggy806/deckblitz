import { defineCard } from "../define.js";

// EDHREC rank 8365.

export default defineCard({
  name: "Sun Quan, Lord of Wu",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 4,
  toughness: 4,
  text: "Creatures you control have horsemanship. (They can't be blocked except by creatures with horsemanship.)",
  static: [
    {
      affects: { scope: "creatures-you-control" },
      grantKeywords: ["horsemanship"],
      text: "Creatures you control have horsemanship.",
    },
  ],
});
