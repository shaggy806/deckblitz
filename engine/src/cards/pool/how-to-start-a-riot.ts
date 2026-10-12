import { defineCard } from "../define.js";

// EDHREC rank 7157.

export default defineCard({
  name: "How to Start a Riot",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["instant"],
  subtypes: ["Lesson"],
  text: "Target creature gains menace until end of turn. (It can't be blocked except by two or more creatures.)\nCreatures target player controls get +2/+0 until end of turn.",
  targets: ["creature", "player"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "grant-keyword", target: 0, keyword: "menace", duration: "end-of-turn" },
      {
        kind: "modify-pt-all",
        // "You" is read as the target player (`controlledByTarget`).
        filter: { type: "creature", controlledBy: "you" },
        controlledByTarget: 1,
        power: 2,
        toughness: 0,
        duration: "end-of-turn",
      },
    ],
  },
});
