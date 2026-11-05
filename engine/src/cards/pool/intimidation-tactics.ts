import { defineCard } from "../define.js";


export default defineCard({
  name: "Intimidation Tactics",
  manaCost: "{B}",
  colors: ["B"],
  types: ["sorcery"],
  cycling: { cost: "{3}" },
  text: "Target opponent reveals their hand. You choose an artifact or creature card from it. Exile that card.\nCycling {3} ({3}, Discard this card: Draw a card.)",
  targets: ["opponent"],
  effect: {
    kind: "discard-chosen",
    target: 0,
    filter: { typesAnyOf: ["artifact", "creature"] },
    destination: "exile",
  },
});
