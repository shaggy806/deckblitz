import { defineCard } from "../define.js";
import { ATTACKS_WHILE_SADDLED, saddle, saddleText } from "../helpers.js";

const ATTACK_TEXT = "Whenever this creature attacks while saddled, create a 3/3 white Angel creature token with flying.";

export default defineCard({
  name: "Seraphic Steed",
  manaCost: "{G}{W}",
  colors: ["G", "W"],
  types: ["creature"],
  subtypes: ["Unicorn", "Mount"],
  power: 2,
  toughness: 2,
  keywords: ["first-strike", "lifelink"],
  text: `First strike, lifelink\n${ATTACK_TEXT}\n${saddleText(4)}`,
  triggered: [
    {
      ...ATTACKS_WHILE_SADDLED,
      targets: [],
      effect: { kind: "create-token", token: "3/3 White Angel Token", count: 1 },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
  activated: [saddle(4, saddleText(4))],
});
