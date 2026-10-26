import { defineCard } from "../define.js";

const MONSTROUS = "As long as this creature is monstrous, it has hexproof and indestructible.";

export default defineCard({
  name: "Fleecemane Lion",
  manaCost: "{G}{W}",
  colors: ["W", "G"],
  types: ["creature"],
  subtypes: ["Cat"],
  power: 3,
  toughness: 3,
  text: `{3}{G}{W}: Monstrosity 1. (If this creature isn't monstrous, put a +1/+1 counter on it and it becomes monstrous.)\n${MONSTROUS}`,
  activated: [
    {
      cost: { mana: "{3}{G}{W}", tap: false },
      targets: [],
      effect: { kind: "monstrosity", amount: 1 },
      resolve: null,
      text: "{3}{G}{W}: Monstrosity 1.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "source", filter: { monstrous: true } },
      grantKeywords: ["hexproof", "indestructible"],
      text: MONSTROUS,
    },
  ],
});
