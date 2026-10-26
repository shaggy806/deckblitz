import { defineCard } from "../define.js";

const TEXT = "As long as you control a Faerie, this creature gets +1/+1 and has flying.";

export default defineCard({
  name: "Boggart Sprite-Chaser",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Warrior"],
  power: 1,
  toughness: 2,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      // "A Faerie" counts this creature too, should it become one.
      condition: { kind: "controls", filter: { subtype: "Faerie" }, atLeast: 1, countsSelf: true },
      grantPt: [1, 1],
      grantKeywords: ["flying"],
      text: TEXT,
    },
  ],
});
