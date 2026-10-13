import { defineCard } from "../define.js";

// EDHREC rank 1090.
//
// The counter goes on first; then it phases out (rule 702.26b) with the
// counter, and whatever is attached to it with it, until its controller's
// next untap step — counters stay on a phased-out permanent (702.26d).
export default defineCard({
  name: "Slip Out the Back",
  manaCost: "{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Put a +1/+1 counter on target creature. It phases out. (Treat it and anything attached to it as though they don't exist until its controller's next turn.)",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      { kind: "phase-out", target: 0 },
    ],
  },
});
