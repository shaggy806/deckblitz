import { defineCard } from "../define.js";
import { ward } from "../helpers.js";

// EDHREC rank 22719.

export default defineCard({
  name: "Leonin Lightbringer",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Cat", "Rebel"],
  power: 3,
  toughness: 2,
  text: "Ward {2} (Whenever this creature becomes the target of a spell or ability an opponent controls, counter it unless that player pays {2}.)\nAs long as this creature is equipped, it gets +1/+1.",
  triggered: [ward({ mana: "{2}" })],
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "source", filter: { equipped: true } },
      grantPt: [1, 1],
      text: "As long as this creature is equipped, it gets +1/+1.",
    },
  ],
});
