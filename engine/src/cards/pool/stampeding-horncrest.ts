import { defineCard } from "../define.js";

const TEXT = "This creature has haste as long as you control another Dinosaur.";

export default defineCard({
  name: "Stampeding Horncrest",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Dinosaur"],
  power: 4,
  toughness: 4,
  text: TEXT,
  static: [
    {
      // A static's `controls` condition leaves its own permanent out: "another".
      affects: { scope: "self" },
      condition: { kind: "controls", filter: { subtype: "Dinosaur" }, atLeast: 1 },
      grantKeywords: ["haste"],
      text: TEXT,
    },
  ],
});
