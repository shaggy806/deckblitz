import { defineCard } from "../define.js";

// EDHREC rank 959.

export default defineCard({
  name: "Sejiri Shelter",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Target creature you control gains protection from the color of your choice until end of turn.",
  targets: ["creature-you-control"],
  effect: { kind: "grant-protection", target: 0, from: { choose: "color" }, duration: "end-of-turn" },
  faces: ["Sejiri Shelter", "Sejiri Glacier"],
});
