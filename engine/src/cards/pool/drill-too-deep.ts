import { defineCard } from "../define.js";

// EDHREC rank 12103.

const COUNTERS_TEXT = "Put five charge counters on target Spacecraft or Planet you control.";
const DESTROY_TEXT = "Destroy target artifact.";

export default defineCard({
  name: "Drill Too Deep",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["instant"],
  text: `Choose one —\n• ${COUNTERS_TEXT}\n• ${DESTROY_TEXT}`,
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: COUNTERS_TEXT,
        targets: [
          { kind: "permanent", whose: "you", filter: { anyOf: [{ subtype: "Spacecraft" }, { subtype: "Planet" }] } },
        ],
        effect: { kind: "add-counter", target: 0, counter: "charge", amount: 5 },
      },
      {
        text: DESTROY_TEXT,
        targets: ["artifact"],
        effect: { kind: "destroy", target: 0 },
      },
    ],
  },
});
