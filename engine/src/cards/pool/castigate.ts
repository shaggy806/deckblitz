import { defineCard } from "../define.js";


export default defineCard({
  name: "Castigate",
  manaCost: "{W}{B}",
  colors: ["W", "B"],
  types: ["sorcery"],
  text: "Target opponent reveals their hand. You choose a nonland card from it and exile that card.",
  targets: ["opponent"],
  effect: { kind: "discard-chosen", target: 0, filter: { notTypes: ["land"] }, destination: "exile" },
});
