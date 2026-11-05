import { defineCard } from "../define.js";

const TEXT = "As long as you have more cards in hand than each opponent, this creature gets +2/+2 and has flying.";

export default defineCard({
  name: "Secretkeeper",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 2,
  toughness: 2,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "player-compare", stat: "hand", compare: "more", than: "each-opponent" },
      grantPt: [2, 2],
      grantKeywords: ["flying"],
      text: TEXT,
    },
  ],
});
