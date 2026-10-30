import { defineCard } from "../define.js";

// Dominaria United (DMU). "As this creature enters, choose another creature
// you control" (rule 614.1c) is `choosePermanentOnEnter`, kept as its chosen
// permanent (rule 607.2d); the static and the leaves trigger name it
// (`scope: "chosen"`, `target: "chosen"`). A chosen creature that has left
// the battlefield is a new object neither reaches (rule 400.7); the leaves
// trigger reads the choice as this creature last existed (608.2h).

const CHOOSE = "As this creature enters, choose another creature you control.";
const ANTHEM = "The chosen creature gets +3/+3 and has flying.";
const LEAVES = "When this creature leaves the battlefield, sacrifice the chosen creature.";

export default defineCard({
  name: "Tyrannical Pitlord",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Demon"],
  power: 6,
  toughness: 6,
  keywords: ["flying", "trample"],
  text: `Flying, trample\n${CHOOSE}\n${ANTHEM}\n${LEAVES}`,
  choosePermanentOnEnter: {
    filter: { type: "creature", controlledBy: "you" },
    prompt: "Choose another creature you control",
  },
  static: [{ affects: { scope: "chosen" }, grantPt: [3, 3], grantKeywords: ["flying"], text: ANTHEM }],
  triggered: [
    {
      trigger: { on: "leaves-battlefield", who: "self" },
      targets: [],
      effect: { kind: "sacrifice-target", target: "chosen" },
      resolve: null,
      text: LEAVES,
    },
  ],
});
