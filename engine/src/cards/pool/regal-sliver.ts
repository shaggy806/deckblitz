import { defineCard } from "../define.js";

// EDHREC rank 9946.
//
// "If you're the monarch" is read as the trigger resolves; "Slivers you
// control" are the ones there then (rule 611.2c).
const GRANTED_TEXT =
  "When this creature enters, Slivers you control get +1/+1 until end of turn if you're the monarch. Otherwise, you become the monarch.";

export default defineCard({
  name: "Regal Sliver",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Sliver"],
  power: 3,
  toughness: 3,
  text: `Sliver creatures you control have "${GRANTED_TEXT}"`,
  static: [
    {
      affects: { scope: "creatures-you-control", subtype: "Sliver" },
      grantsTriggered: [
        {
          trigger: { on: "enters-battlefield", who: "self" },
          targets: [],
          effect: {
            kind: "conditional",
            condition: { kind: "monarch", who: "you" },
            then: {
              kind: "modify-pt-all",
              filter: { subtype: "Sliver", controlledBy: "you" },
              power: 1,
              toughness: 1,
              duration: "end-of-turn",
            },
            else: { kind: "become-monarch" },
          },
          resolve: null,
          text: GRANTED_TEXT,
        },
      ],
      text: `Sliver creatures you control have "${GRANTED_TEXT}"`,
    },
  ],
});
