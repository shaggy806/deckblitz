import { defineCard } from "../define.js";

// EDHREC rank 13559.

const ENTER_TEXT = "When this enchantment enters, incubate 2.";
const ANTHEM_TEXT = "Phyrexians you control get +1/+1.";

export default defineCard({
  name: "Sculpted Perfection",
  manaCost: "{2}{W}{B}",
  colors: ["W", "B"],
  types: ["enchantment"],
  text: `${ENTER_TEXT} (Create an Incubator token with two +1/+1 counters on it and "{2}: Transform this token." It transforms into a 0/0 Phyrexian artifact creature.)\n${ANTHEM_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "incubate", amount: 2 },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "creatures-you-control", subtype: "Phyrexian" },
      grantPt: [1, 1],
      text: ANTHEM_TEXT,
    },
  ],
});
