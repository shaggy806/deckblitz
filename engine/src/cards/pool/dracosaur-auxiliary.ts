import { defineCard } from "../define.js";
import { ATTACKS_WHILE_SADDLED, saddle, saddleText } from "../helpers.js";

const ATTACK_TEXT = "Whenever this creature attacks while saddled, it deals 2 damage to any target.";

export default defineCard({
  name: "Dracosaur Auxiliary",
  manaCost: "{4}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Dinosaur", "Dragon", "Mount"],
  power: 4,
  toughness: 4,
  keywords: ["flying", "haste"],
  text: `Flying, haste\n${ATTACK_TEXT}\n${saddleText(3)}`,
  triggered: [
    {
      ...ATTACKS_WHILE_SADDLED,
      targets: ["any-target"],
      effect: { kind: "damage", amount: 2, target: 0 },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
  activated: [saddle(3, saddleText(3))],
});
