import { defineCard } from "../define.js";

export default defineCard({
  name: "Coast Watcher",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Bird", "Soldier"],
  power: 1,
  toughness: 1,
  keywords: ["flying"],
  text: "Flying, protection from green",
  static: [
    {
      affects: { scope: "self" },
      protection: { colors: ["G"] },
      text: "Protection from green",
    },
  ],
});
