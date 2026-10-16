import { defineCard } from "../define.js";

// EDHREC rank 9745.
//
// "Sacrifice an artifact. If you do" isn't a may: with an artifact, one is
// sacrificed (its controller's pick), and only a sacrifice that happened
// earns the counters (Highway Robbery's this-way check).
const TEXT = "When this creature enters, choose one —";

export default defineCard({
  name: "Gearbane Orangutan",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Ape"],
  power: 2,
  toughness: 2,
  keywords: ["reach"],
  text: "Reach\nWhen this creature enters, choose one —\n• Destroy up to one target artifact.\n• Sacrifice an artifact. If you do, put two +1/+1 counters on this creature.",
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
            text: "Destroy up to one target artifact.",
            targets: [{ kind: "optional", of: "artifact" }],
            effect: { kind: "destroy", target: 0 },
          },
          {
            text: "Sacrifice an artifact. If you do, put two +1/+1 counters on this creature.",
            effect: {
              kind: "sequence",
              effects: [
                { kind: "sacrifice", who: "you", filter: { type: "artifact" }, count: 1 },
                {
                  kind: "conditional",
                  condition: { kind: "this-way", what: "sacrificed", who: "you" },
                  then: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 2 },
                },
              ],
            },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
