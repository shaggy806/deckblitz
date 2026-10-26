import { defineCard } from "../define.js";

// Portal. EDHREC rank 27826.
export default defineCard({
  name: "Natural Spring",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Target player gains 8 life.",
  targets: ["player"],
  effect: { kind: "gain-life", amount: 8, toControllerOfTarget: 0 },
});
