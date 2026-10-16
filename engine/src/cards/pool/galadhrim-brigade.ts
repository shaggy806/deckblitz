import { defineCard } from "../define.js";
import { squadTrigger } from "../helpers.js";

// Each token copy is an Elf with the same lord ability, so each gives the
// others +1/+1.
const SQUAD_TEXT =
  "Squad {1}{G} (As an additional cost to cast this spell, you may pay {1}{G} any number of times. When this creature enters, create that many tokens that are copies of it.)";
const LORD_TEXT = "Other Elves you control get +1/+1.";

export default defineCard({
  name: "Galadhrim Brigade",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Soldier"],
  power: 2,
  toughness: 2,
  kicker: { cost: "{1}{G}", multi: true, keyword: "squad" },
  text: `${SQUAD_TEXT}\n${LORD_TEXT}`,
  static: [
    {
      affects: { scope: "creatures-you-control", excludeSelf: true, subtype: "Elf" },
      grantPt: [1, 1],
      text: LORD_TEXT,
    },
  ],
  triggered: [squadTrigger()],
});
