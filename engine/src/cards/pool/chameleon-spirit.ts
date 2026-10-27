import { defineCard } from "../define.js";
import type { StaticAbility } from "../define.js";
import type { Color } from "../../mana.js";

// Mercadian Masques (MMQ). EDHREC rank 24835.
//
// The characteristic-defining ability (rule 604.3) is one static per colour, each gated on the
// colour chosen as it entered (`chosen-on-enter`); with no colour chosen (anywhere but the
// battlefield) none applies and it is 0/0.

const PT_TEXT =
  "Chameleon Spirit's power and toughness are each equal to the number of permanents of the chosen color your opponents control.";
const COLORS: readonly Color[] = ["W", "U", "B", "R", "G"];

export default defineCard({
  name: "Chameleon Spirit",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Illusion", "Spirit"],
  power: 0,
  toughness: 0,
  text: `As this creature enters, choose a color.\n${PT_TEXT}`,
  chooseOnEnter: ["W", "U", "B", "R", "G"],
  static: COLORS.map(
    (color): StaticAbility => ({
      affects: { scope: "self" },
      condition: { kind: "chosen-on-enter", value: color },
      setBasePtFromCount: {
        countOf: { countOf: { colors: [color], controlledBy: "opponent" } },
        plusPower: 0,
        plusToughness: 0,
      },
      text: PT_TEXT,
    }),
  ),
});
