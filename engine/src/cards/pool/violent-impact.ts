import { defineCard } from "../define.js";

export default defineCard({
  name: "Violent Impact",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["sorcery"],
  cycling: { cost: "{2}" },
  text: "Destroy target artifact or land.\nCycling {2} ({2}, Discard this card: Draw a card.)",
  targets: [{ kind: "permanent", filter: { typesAnyOf: ["artifact", "land"] } }],
  effect: { kind: "destroy", target: 0 },
});
