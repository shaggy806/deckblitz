import { defineCard } from "../define.js";

// EDHREC rank 23996.

const TEXT = "This creature gets +0/+3 as long as it's untapped.";

export default defineCard({
  name: "Giant Tortoise",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Turtle"],
  power: 1,
  toughness: 1,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "source", filter: { tapped: false } },
      grantPt: [0, 3],
      text: TEXT,
    },
  ],
});
