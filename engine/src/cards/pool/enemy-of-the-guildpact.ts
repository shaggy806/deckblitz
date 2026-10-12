import { defineCard } from "../define.js";

export default defineCard({
  name: "Enemy of the Guildpact",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 4,
  toughness: 2,
  text: "Protection from multicolored",
  static: [
    {
      affects: { scope: "self" },
      protection: { filter: { multicolored: true } },
      text: "Protection from multicolored",
    },
  ],
});
