import { defineCard } from "../define.js";

// EDHREC rank 30640.
//
// "A Human" is any permanent with the Human subtype — no card type asked.
const TEXT = "This creature has haste as long as an opponent controls a Human.";

export default defineCard({
  name: "Night Revelers",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Vampire"],
  power: 4,
  toughness: 4,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "opponent-controls", filter: { subtype: "Human" }, atLeast: 1 },
      grantKeywords: ["haste"],
      text: TEXT,
    },
  ],
});
