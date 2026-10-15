import { defineCard } from "../define.js";

// EDHREC rank 30733.

const EQUIPPED_TEXT = "As long as this creature is equipped, it gets +2/+0 and has menace.";

export default defineCard({
  name: "Armed Assailant",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Villain"],
  power: 1,
  toughness: 3,
  keywords: ["deathtouch"],
  text: "Deathtouch\nAs long as this creature is equipped, it gets +2/+0 and has menace. (It can't be blocked except by two or more creatures.)",
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "source", filter: { equipped: true } },
      grantPt: [2, 0],
      grantKeywords: ["menace"],
      text: EQUIPPED_TEXT,
    },
  ],
});
