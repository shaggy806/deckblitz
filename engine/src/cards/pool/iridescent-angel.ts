import { defineCard } from "../define.js";

// Odyssey. EDHREC rank 25574. "Protection from each color" is protection
// from white, from blue, from black, from red and from green (the ruling).

export default defineCard({
  name: "Iridescent Angel",
  manaCost: "{5}{W}{U}",
  colors: ["W", "U"],
  types: ["creature"],
  subtypes: ["Angel"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: "Flying, protection from each color",
  static: [
    {
      affects: { scope: "self" },
      protection: { colors: ["W", "U", "B", "R", "G"] },
      text: "Protection from each color",
    },
  ],
});
