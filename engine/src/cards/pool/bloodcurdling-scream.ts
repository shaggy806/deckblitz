import { defineCard } from "../define.js";

// Portal. EDHREC rank 28892. Howl from Beyond at sorcery speed.
export default defineCard({
  name: "Bloodcurdling Scream",
  manaCost: "{X}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Target creature gets +X/+0 until end of turn.",
  targets: ["creature"],
  effect: { kind: "modify-pt", target: 0, power: "x", toughness: 0, duration: "end-of-turn" },
});
