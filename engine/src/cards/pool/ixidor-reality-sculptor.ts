import { defineCard } from "../define.js";

// Every face-down creature on the battlefield, whoever controls it. The
// ability turns any of them up, an opponent's too, with nothing paid.

const STATIC = "Face-down creatures get +1/+1.";
const TURN_UP = "{2}{U}: Turn target face-down creature face up.";

export default defineCard({
  name: "Ixidor, Reality Sculptor",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  supertypes: ["legendary"],
  subtypes: ["Human", "Wizard"],
  power: 3,
  toughness: 4,
  text: `${STATIC}\n${TURN_UP}`,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", faceDown: true } },
      grantPt: [1, 1],
      text: STATIC,
    },
  ],
  activated: [
    {
      cost: { mana: "{2}{U}", tap: false },
      targets: [{ kind: "permanent", filter: { type: "creature", faceDown: true } }],
      effect: { kind: "turn-face-up", target: 0 },
      resolve: null,
      text: TURN_UP,
    },
  ],
});
