import { defineCard } from "../define.js";

// EDHREC rank 15864. The target is chosen as it's cast, the colour as it
// resolves (the ruling).

export default defineCard({
  name: "Stave Off",
  manaCost: "{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Target creature gains protection from the color of your choice until end of turn.",
  targets: ["creature"],
  effect: { kind: "grant-protection", target: 0, from: { choose: "color" }, duration: "end-of-turn" },
});
