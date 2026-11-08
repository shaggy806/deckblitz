import { defineCard } from "../define.js";

const TEXT = "All creatures with flying able to block this creature do so.";

export default defineCard({
  name: "Talruum Piper",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Minotaur"],
  power: 3,
  toughness: 3,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      restrictions: [{ kind: "must-be-blocked", by: { type: "creature", keyword: "flying" } }],
      text: TEXT,
    },
  ],
});
