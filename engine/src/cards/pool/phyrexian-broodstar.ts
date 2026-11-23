import { defineCard } from "../define.js";
import { affinity } from "../helpers.js";

// Playtest card (Mystery Booster 2). "Phyrexians" are permanents with the
// Phyrexian creature type; it counts itself on the battlefield.
const PT_TEXT =
  "Phyrexian Broodstar's power and toughness are each equal to the number of Phyrexians you control.";

export default defineCard({
  name: "Phyrexian Broodstar",
  manaCost: "{6}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Beast"],
  power: 0,
  toughness: 0,
  keywords: ["flying"],
  text: `Affinity for Phyrexians (This spell costs {1} less to cast for each Phyrexian you control.)\nFlying\n${PT_TEXT}`,
  selfCostReduction: affinity({ subtype: "Phyrexian" }),
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: {
        countOf: { countOf: { subtype: "Phyrexian", controlledBy: "you" } },
        plusPower: 0,
        plusToughness: 0,
      },
      text: PT_TEXT,
    },
  ],
});
