import { defineCard } from "../define.js";

// EDHREC rank 10208.

export default defineCard({
  name: "Brokers Confluence",
  manaCost: "{2}{G}{W}{U}",
  colors: ["W", "U", "G"],
  types: ["instant"],
  text: "Choose three. You may choose the same mode more than once.\n• Proliferate. (Choose any number of permanents and/or players, then give each another counter of each kind already there.)\n• Target creature phases out. (Treat it and anything attached to it as though they don't exist until its controller's next turn.)\n• Counter target activated or triggered ability.",
  castModal: {
    minModes: 3,
    maxModes: 3,
    repeatModes: true,
    modes: [
      { text: "Proliferate.", effect: { kind: "proliferate" } },
      {
        text: "Target creature phases out.",
        targets: ["creature"],
        effect: { kind: "phase-out", target: 0 },
      },
      {
        text: "Counter target activated or triggered ability.",
        targets: ["activated-or-triggered-ability"],
        effect: { kind: "counter", target: 0 },
      },
    ],
  },
});
