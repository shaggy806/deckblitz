import { defineCard } from "../define.js";

// EDHREC rank 12233.

export default defineCard({
  name: "Proud Pack-Rhino",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Rhino"],
  power: 3,
  toughness: 3,
  text: "When this creature enters, choose one —\n• Put a shield counter on target permanent. (If it would be dealt damage or destroyed, remove a shield counter from it instead.)\n• Proliferate. (Choose any number of permanents and/or players, then give each another counter of each kind already there.)",
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
          { text: "Put a shield counter on target permanent.", targets: ["permanent"], effect: { kind: "add-counter", target: 0, counter: "shield", amount: 1 } },
          { text: "Proliferate.", effect: { kind: "proliferate" } },
        ],
      },
      resolve: null,
      text: "When this creature enters, choose one —",
    },
  ],
});
