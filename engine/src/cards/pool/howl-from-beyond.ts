import { defineCard } from "../define.js";

// Limited Edition Alpha. EDHREC rank 14867.
export default defineCard({
  name: "Howl from Beyond",
  manaCost: "{X}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Target creature gets +X/+0 until end of turn.",
  targets: ["creature"],
  effect: { kind: "modify-pt", target: 0, power: "x", toughness: 0, duration: "end-of-turn" },
});
