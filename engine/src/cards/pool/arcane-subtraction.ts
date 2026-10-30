import { defineCard } from "../define.js";
import { learn } from "../helpers.js";

// EDHREC rank 25615.

export default defineCard({
  name: "Arcane Subtraction",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Target creature gets -4/-0 until end of turn.\nLearn. (You may reveal a Lesson card you own from outside the game and put it into your hand, or discard a card to draw a card.)",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: -4, toughness: 0, duration: "end-of-turn" },
      learn(),
    ],
  },
});
