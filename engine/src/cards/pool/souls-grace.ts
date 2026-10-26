import { defineCard } from "../define.js";

// Conflux (CON). The power is read as it resolves.

export default defineCard({
  name: "Soul's Grace",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "You gain life equal to target creature's power.",
  targets: ["creature"],
  effect: { kind: "gain-life", amount: { powerOf: 0 } },
});
