import { defineCard } from "../define.js";

const TEXT = "This creature gets +1/+2 as long as you have one or fewer cards in hand.";

export default defineCard({
  name: "Thresher Lizard",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Lizard"],
  power: 3,
  toughness: 2,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "hand-size", atMost: 1 },
      grantPt: [1, 2],
      text: TEXT,
    },
  ],
});
