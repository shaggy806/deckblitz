import { defineCard } from "../define.js";

// EDHREC rank 16176.

const ENTER_TEXT = "When this enchantment enters, you gain 5 life and incubate 5.";
const REACH_TEXT = "Phyrexians you control have reach.";

export default defineCard({
  name: "Tangled Skyline",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: `${ENTER_TEXT} (Create an Incubator token with five +1/+1 counters on it and "{2}: Transform this token." It transforms into a 0/0 Phyrexian artifact creature.)\n${REACH_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "gain-life", amount: 5 },
          { kind: "incubate", amount: 5 },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "creatures-you-control", subtype: "Phyrexian" },
      grantKeywords: ["reach"],
      text: REACH_TEXT,
    },
  ],
});
