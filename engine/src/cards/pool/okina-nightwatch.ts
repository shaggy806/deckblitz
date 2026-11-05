import { defineCard } from "../define.js";

const TEXT = "As long as you have more cards in hand than each opponent, this creature gets +3/+3.";

export default defineCard({
  name: "Okina Nightwatch",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Monk"],
  power: 4,
  toughness: 3,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "player-compare", stat: "hand", compare: "more", than: "each-opponent" },
      grantPt: [3, 3],
      text: TEXT,
    },
  ],
});
