import { defineCard } from "../define.js";

export default defineCard({
  name: "Infiltrate",
  manaCost: "{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Target creature can't be blocked this turn.",
  targets: ["creature"],
  effect: { kind: "grant-keyword", target: 0, keyword: "unblockable", duration: "end-of-turn" },
});
