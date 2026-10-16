import { defineCard } from "../define.js";
import { squadTrigger } from "../helpers.js";

// Each token copy has the anthem too, so the copies pump each other.
const SQUAD_TEXT =
  "Squad {2} (As an additional cost to cast this spell, you may pay {2} any number of times. When this creature enters, create that many tokens that are copies of it.)";
const ANTHEM_TEXT = "Other creatures you control get +1/+1.";

export default defineCard({
  name: "Ultramarines Honour Guard",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Astartes", "Warrior"],
  power: 2,
  toughness: 2,
  kicker: { cost: "{2}", multi: true, keyword: "squad" },
  text: `${SQUAD_TEXT}\n${ANTHEM_TEXT}`,
  static: [
    {
      affects: { scope: "creatures-you-control", excludeSelf: true },
      grantPt: [1, 1],
      text: ANTHEM_TEXT,
    },
  ],
  triggered: [squadTrigger()],
});
