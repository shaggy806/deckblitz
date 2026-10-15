import { defineCard } from "../define.js";

// EDHREC rank 17006.
//
// "Target Merfolk you control" is any Merfolk permanent you control — this
// one included.
const END_TEXT = "At the beginning of your end step, untap target Merfolk you control.";

export default defineCard({
  name: "Deepchannel Duelist",
  manaCost: "{W}{U}",
  colors: ["W", "U"],
  types: ["creature"],
  subtypes: ["Merfolk", "Soldier"],
  power: 2,
  toughness: 2,
  text: `${END_TEXT}\nOther Merfolk you control get +1/+1.`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [{ kind: "permanent", whose: "you", filter: { subtype: "Merfolk" } }],
      effect: { kind: "untap", target: 0 },
      resolve: null,
      text: END_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "creatures-you-control", excludeSelf: true, subtype: "Merfolk" },
      grantPt: [1, 1],
      text: "Other Merfolk you control get +1/+1.",
    },
  ],
});
