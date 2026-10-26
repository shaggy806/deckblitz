import { defineCard } from "../define.js";

export default defineCard({
  name: "Untamed Might",
  manaCost: "{X}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Target creature gets +X/+X until end of turn.",
  targets: ["creature"],
  effect: { kind: "modify-pt", target: 0, power: "x", toughness: "x", duration: "end-of-turn" },
});
