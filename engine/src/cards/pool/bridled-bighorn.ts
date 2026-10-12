import { defineCard } from "../define.js";
import { ATTACKS_WHILE_SADDLED, saddle, saddleText } from "../helpers.js";

const ATTACK_TEXT = "Whenever this creature attacks while saddled, create a 1/1 white Sheep creature token.";

export default defineCard({
  name: "Bridled Bighorn",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Sheep", "Mount"],
  power: 3,
  toughness: 4,
  keywords: ["vigilance"],
  text: `Vigilance\n${ATTACK_TEXT}\n${saddleText(2)}`,
  triggered: [
    {
      ...ATTACKS_WHILE_SADDLED,
      targets: [],
      effect: { kind: "create-token", token: "Sheep Token", count: 1 },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
  activated: [saddle(2, saddleText(2))],
});
