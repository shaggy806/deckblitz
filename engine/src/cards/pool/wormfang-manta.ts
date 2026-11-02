import { defineCard } from "../define.js";

// Judgment. Both triggers before its controller's next turn: the skip takes
// the extra turn, the first of theirs to begin (rule 614.10a).
export default defineCard({
  name: "Wormfang Manta",
  manaCost: "{5}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Nightmare", "Fish", "Beast"],
  power: 6,
  toughness: 1,
  keywords: ["flying"],
  text: "Flying\nWhen this creature enters, you skip your next turn.\nWhen this creature leaves the battlefield, you take an extra turn after this one.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "skip-turn", who: "you" },
      resolve: null,
      text: "When this creature enters, you skip your next turn.",
    },
    {
      trigger: { on: "leaves-battlefield", who: "self" },
      targets: [],
      effect: { kind: "take-extra-turn" },
      resolve: null,
      text: "When this creature leaves the battlefield, you take an extra turn after this one.",
    },
  ],
});
