import { defineCard } from "../define.js";

// The mode is chosen as the trigger goes on the stack (the ruling); with no
// creature dealt damage this turn, the destroy mode can't be chosen.

const TEXT =
  "When this creature enters, choose one —\n• Put a +1/+1 counter on this creature.\n• Destroy target creature that was dealt damage this turn.";

export default defineCard({
  name: "Hooded Assassin",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Assassin"],
  power: 1,
  toughness: 2,
  text: TEXT,
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
          {
            text: "Put a +1/+1 counter on this creature.",
            effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
          },
          {
            text: "Destroy target creature that was dealt damage this turn.",
            targets: [{ kind: "permanent", whose: "any", filter: { type: "creature", damagedThisTurnBy: {} } }],
            effect: { kind: "destroy", target: 0 },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
