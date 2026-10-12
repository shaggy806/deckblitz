import { defineCard } from "../define.js";

export default defineCard({
  name: "Trailblazer",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Target creature can't be blocked this turn.",
  targets: ["creature"],
  effect: { kind: "grant-keyword", target: 0, keyword: "unblockable", duration: "end-of-turn" },
});
