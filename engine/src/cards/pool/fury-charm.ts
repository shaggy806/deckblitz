import { defineCard } from "../define.js";

// EDHREC rank 9822.

export default defineCard({
  name: "Fury Charm",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Choose one —\n• Destroy target artifact.\n• Target creature gets +1/+1 and gains trample until end of turn.\n• Remove two time counters from target permanent or suspended card.",
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "Destroy target artifact.",
        targets: ["artifact"],
        effect: { kind: "destroy", target: 0 },
      },
      {
        text: "Target creature gets +1/+1 and gains trample until end of turn.",
        targets: ["creature"],
        effect: {
          kind: "sequence",
          effects: [
            { kind: "modify-pt", target: 0, power: 1, toughness: 1, duration: "end-of-turn" },
            { kind: "grant-keyword", target: 0, keyword: "trample", duration: "end-of-turn" },
          ],
        },
      },
      {
        text: "Remove two time counters from target permanent or suspended card.",
        targets: [
          {
            kind: "one-of",
            of: ["permanent", { kind: "card-in-exile", filter: { suspended: true } }],
          },
        ],
        effect: { kind: "remove-counter", target: 0, counter: "time", amount: 2 },
      },
    ],
  },
});
