import { defineCard } from "../define.js";

// EDHREC rank 27830. Maarika's "as long as it's your turn".

export default defineCard({
  name: "Faithful Pikemaster",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Rhino", "Monk", "Soldier"],
  power: 3,
  toughness: 4,
  text: "When this creature enters, scry 2. (Look at the top two cards of your library, then put any number of them on the bottom and the rest on top in any order.)\nAs long as it's your turn, this creature has first strike.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "scry", amount: 2 },
      resolve: null,
      text: "When this creature enters, scry 2.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "your-turn" },
      grantKeywords: ["first-strike"],
      text: "As long as it's your turn, this creature has first strike.",
    },
  ],
});
