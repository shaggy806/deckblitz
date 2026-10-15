import { defineCard } from "../define.js";

// EDHREC rank 24224. Lake-town Toymaker's "if you've drawn two or more
// cards this turn", as a static's condition.

const KEYWORD_TEXT = "As long as you've drawn two or more cards this turn, this creature has lifelink and menace.";

export default defineCard({
  name: "Foggy Swamp Hunters",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Ranger", "Ally"],
  power: 3,
  toughness: 4,
  text: `${KEYWORD_TEXT} (It can't be blocked except by two or more creatures.)`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "turn-stat", stat: "cards-drawn", who: "you", atLeast: 2 },
      grantKeywords: ["lifelink", "menace"],
      text: KEYWORD_TEXT,
    },
  ],
});
