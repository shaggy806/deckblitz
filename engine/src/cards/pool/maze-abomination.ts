import { defineCard } from "../define.js";

export default defineCard({
  name: "Maze Abomination",
  manaCost: "{5}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 4,
  toughness: 5,
  keywords: ["deathtouch"],
  text: "Deathtouch (Any amount of damage this deals to a creature is enough to destroy it.)\nMulticolored creatures you control have deathtouch.",
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", controlledBy: "you", multicolored: true } },
      grantKeywords: ["deathtouch"],
      text: "Multicolored creatures you control have deathtouch.",
    },
  ],
});
