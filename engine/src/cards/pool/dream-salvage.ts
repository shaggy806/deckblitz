import { defineCard } from "../define.js";

export default defineCard({
  name: "Dream Salvage",
  manaCost: "{U/B}",
  colors: ["U", "B"],
  types: ["instant"],
  text: "Draw cards equal to the number of cards target opponent discarded this turn.",
  targets: ["opponent"],
  effect: { kind: "draw", amount: { turnHistory: "discarded", target: 0 } },
});
