import { defineCard } from "../define.js";

export default defineCard({
  name: "Broken Concentration",
  manaCost: "{1}{U}{U}",
  colors: ["U"],
  types: ["instant"],
  madness: { cost: "{3}{U}" },
  text: "Counter target spell.\nMadness {3}{U} (If you discard this card, discard it into exile. When you do, cast it for its madness cost or put it into your graveyard.)",
  targets: ["spell"],
  effect: { kind: "counter", target: 0 },
});
