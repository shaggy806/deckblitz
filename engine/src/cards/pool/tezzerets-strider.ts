import { defineCard } from "../define.js";

const TEXT = "As long as you control a Tezzeret planeswalker, this creature has menace.";

export default defineCard({
  name: "Tezzeret's Strider",
  manaCost: "{3}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Golem"],
  power: 3,
  toughness: 1,
  text: `${TEXT} (It can't be blocked except by two or more creatures.)`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "controls", filter: { type: "planeswalker", subtype: "Tezzeret" }, atLeast: 1 },
      grantKeywords: ["menace"],
      text: TEXT,
    },
  ],
});
