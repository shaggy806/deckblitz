import { defineCard } from "../define.js";

// EDHREC rank 28326.

const ENTER_TEXT = "When this creature enters, create a 4/4 green Bear creature token.";

export default defineCard({
  name: "Bear's Companion",
  manaCost: "{2}{G}{U}{R}",
  colors: ["U", "R", "G"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 2,
  toughness: 2,
  text: ENTER_TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Bear Token (Green 4/4)", count: 1 },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
