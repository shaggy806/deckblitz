import { defineCard } from "../define.js";
import { ATTACKS_WHILE_SADDLED, saddle, saddleText } from "../helpers.js";

// Untapped, it's still attacking (rule 506.4).
const ATTACK_TEXT = "Whenever this creature attacks while saddled, untap it and put a +1/+1 counter on it.";

export default defineCard({
  name: "Brightfield Mustang",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Horse", "Mount"],
  power: 3,
  toughness: 3,
  text: `${ATTACK_TEXT}\n${saddleText(1)}`,
  triggered: [
    {
      ...ATTACKS_WHILE_SADDLED,
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "untap", target: "source" },
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
        ],
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
  activated: [saddle(1, saddleText(1))],
});
