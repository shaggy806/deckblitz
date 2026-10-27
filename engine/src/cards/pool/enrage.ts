import { defineCard } from "../define.js";

// EDHREC rank 20793.

export default defineCard({
  name: "Enrage",
  manaCost: "{X}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Target creature gets +X/+0 until end of turn.",
  targets: ["creature"],
  effect: { kind: "modify-pt", target: 0, power: "x", toughness: 0, duration: "end-of-turn" },
});
