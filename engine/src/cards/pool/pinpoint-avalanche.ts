import { defineCard } from "../define.js";

// EDHREC rank 31936.
export default defineCard({
  name: "Pinpoint Avalanche",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Pinpoint Avalanche deals 4 damage to target creature. The damage can't be prevented.",
  targets: ["creature"],
  effect: { kind: "damage", amount: 4, target: 0, cantBePrevented: true },
});
