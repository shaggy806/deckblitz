import { defineCard } from "../define.js";

// EDHREC rank 25187.
//
// Rulings:
//   [2006-02-01] Auras your opponent gains control of won't move from where they are.
//   [2006-02-01] The permanents don't return to your control when Sky Swallower leaves the
//     battlefield.
//
// One lasting control change (rule 613.7b), every other permanent you control
// as it resolves, to the targeted opponent — for good, so it outlives the
// Swallower (the ruling).
const TEXT = "When this creature enters, target opponent gains control of all other permanents you control.";

export default defineCard({
  name: "Sky Swallower",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Leviathan"],
  power: 8,
  toughness: 8,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["opponent"],
      effect: {
        kind: "gain-control-all",
        filter: { controlledBy: "you" },
        who: { target: 0 },
        exceptSource: true,
        untilEndOfTurn: false,
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
