import { defineCard } from "../define.js";
import { BEFORE_ATTACKERS_DECLARED } from "../helpers.js";

const TEXT = "{T}: You gain 1 life. Activate only during your turn, before attackers are declared.";

export default defineCard({
  name: "Shu Farmer",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "gain-life", amount: 1 },
      resolve: null,
      condition: BEFORE_ATTACKERS_DECLARED,
      text: TEXT,
    },
  ],
});
