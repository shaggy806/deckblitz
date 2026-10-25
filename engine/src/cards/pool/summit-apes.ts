import { defineCard } from "../define.js";

// EDHREC rank 13113.
//
// Rulings:
//   [2010-03-01] Whether you control a Mountain matters only as the defending player declares
//     blockers. Once it’s blocked, gaining or losing control of a Mountain won’t affect Summit
//     Apes’s blockers.

const TEXT = "As long as you control a Mountain, this creature has menace. (It can't be blocked except by two or more creatures.)";

export default defineCard({
  name: "Summit Apes",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Ape"],
  power: 5,
  toughness: 2,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "controls", filter: { subtype: "Mountain" }, atLeast: 1 },
      grantKeywords: ["menace"],
      text: TEXT,
    },
  ],
});
