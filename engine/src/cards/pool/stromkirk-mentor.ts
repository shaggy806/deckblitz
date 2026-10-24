import { defineCard } from "../define.js";

// EDHREC rank 25640.

const TEXT = "When this creature enters, put a +1/+1 counter on another target Vampire you control.";

export default defineCard({
  name: "Stromkirk Mentor",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Vampire", "Soldier"],
  power: 4,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "other", of: { kind: "permanent", whose: "you", filter: { subtype: "Vampire" } } }],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
