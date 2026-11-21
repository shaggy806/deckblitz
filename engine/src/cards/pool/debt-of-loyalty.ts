import { defineCard } from "../define.js";

export default defineCard({
  name: "Debt of Loyalty",
  manaCost: "{1}{W}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Regenerate target creature. You gain control of that creature if it regenerates this way.",
  targets: ["creature"],
  effect: {
    kind: "regenerate",
    target: 0,
    ifRegenerates: { kind: "gain-control", target: 0, untilEndOfTurn: false },
  },
});
