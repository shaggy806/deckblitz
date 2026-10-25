import { defineCard } from "../define.js";

const TEXT = "This creature can't block unless you control another Minotaur.";

export default defineCard({
  name: "Felhide Brawler",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Minotaur"],
  power: 2,
  toughness: 2,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      condition: {
        kind: "not",
        of: { kind: "controls", filter: { subtype: "Minotaur" }, atLeast: 1, excludeSelf: true },
      },
      restrictions: ["cant-block"],
      text: TEXT,
    },
  ],
});
