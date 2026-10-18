import { defineCard } from "../define.js";

// EDHREC rank 8324.

const INCUBATE_TEXT = "When this enchantment enters, incubate 4.";
const VIGILANCE_TEXT = "Phyrexians you control have vigilance.";

export default defineCard({
  name: "Phyrexian Awakening",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: `${INCUBATE_TEXT} (Create an Incubator token with four +1/+1 counters on it and "{2}: Transform this token." It transforms into a 0/0 Phyrexian artifact creature.)\n${VIGILANCE_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "incubate", amount: 4 },
      resolve: null,
      text: INCUBATE_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "creatures-you-control", subtype: "Phyrexian" },
      grantKeywords: ["vigilance"],
      text: VIGILANCE_TEXT,
    },
  ],
});
