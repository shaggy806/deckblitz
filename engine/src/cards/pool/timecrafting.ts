import { defineCard } from "../define.js";

// EDHREC rank 13981.

export default defineCard({
  name: "Timecrafting",
  manaCost: "{X}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Choose one —\n• Remove X time counters from target permanent or suspended card.\n• Put X time counters on target permanent with a time counter on it or suspended card.",
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "Remove X time counters from target permanent or suspended card.",
        targets: [
          {
            kind: "one-of",
            of: ["permanent", { kind: "card-in-exile", filter: { suspended: true } }],
          },
        ],
        effect: { kind: "remove-counter", target: 0, counter: "time", amount: "x" },
      },
      {
        text: "Put X time counters on target permanent with a time counter on it or suspended card.",
        targets: [
          {
            kind: "one-of",
            of: [
              {
                kind: "permanent",
                filter: { counters: { kind: "time", compare: { op: "gte", n: 1 } } },
              },
              { kind: "card-in-exile", filter: { suspended: true } },
            ],
          },
        ],
        effect: { kind: "add-counter", target: 0, counter: "time", amount: "x" },
      },
    ],
  },
});
