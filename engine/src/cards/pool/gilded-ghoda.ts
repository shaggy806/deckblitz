import { defineCard } from "../define.js";
import { ATTACKS_WHILE_SADDLED, saddle, saddleText } from "../helpers.js";

const ATTACK_TEXT =
  "Whenever this creature attacks while saddled, create a Treasure token. (It's an artifact with \"{T}, Sacrifice this token: Add one mana of any color.\")";

export default defineCard({
  name: "Gilded Ghoda",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Horse", "Mount"],
  power: 2,
  toughness: 2,
  text: `${ATTACK_TEXT}\n${saddleText(1)}`,
  triggered: [
    {
      ...ATTACKS_WHILE_SADDLED,
      targets: [],
      effect: { kind: "create-token", token: "Treasure Token", count: 1 },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
  activated: [saddle(1, saddleText(1))],
});
