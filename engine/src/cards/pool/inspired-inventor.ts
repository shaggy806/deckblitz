import { defineCard } from "../define.js";

// EDHREC rank 17411.
//
// A modal enters trigger: the mode is chosen as it goes on the stack, and
// the counter mode's target with it (rule 700.2b).
export default defineCard({
  name: "Inspired Inventor",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Artificer"],
  power: 2,
  toughness: 2,
  text: "When this creature enters, choose one —\n• You get {E}{E}{E} (three energy counters).\n• Put a +1/+1 counter on target creature.\n• Create a 1/1 colorless Servo artifact creature token.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          { text: "You get {E}{E}{E} (three energy counters).", effect: { kind: "get-energy", amount: 3 } },
          {
            text: "Put a +1/+1 counter on target creature.",
            targets: ["creature"],
            effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
          },
          {
            text: "Create a 1/1 colorless Servo artifact creature token.",
            effect: { kind: "create-token", token: "Servo Token", count: 1 },
          },
        ],
      },
      resolve: null,
      text: "When this creature enters, choose one —",
    },
  ],
});
