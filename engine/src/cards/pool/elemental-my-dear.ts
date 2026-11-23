import { defineCard } from "../define.js";

export default defineCard({
  name: "Elemental, My Dear",
  manaCost: "{X}{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Investigate X times, then create an 0/0 Blue Elemental creature token. Put +1/+1 counters on that token equal to the number of Clues you control.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "create-token", token: "Clue Token", investigate: true, count: "x" },
      {
        kind: "create-token",
        token: "0/0 Blue Elemental Token",
        count: 1,
        // Created as a 0/0, then given the counters (counted as they're put).
        thenCounters: { kind: "+1/+1", amount: { countOf: { subtype: "Clue", controlledBy: "you" } } },
      },
    ],
  },
});
