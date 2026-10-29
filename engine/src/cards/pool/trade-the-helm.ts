import { defineCard } from "../define.js";

// EDHREC rank 16238.

export default defineCard({
  name: "Trade the Helm",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["sorcery"],
  cycling: { cost: "{2}" },
  text: "Exchange control of target artifact or creature you control and target artifact or creature an opponent controls.\nCycling {2} ({2}, Discard this card: Draw a card.)",
  targets: [
    { kind: "permanent", whose: "you", filter: { typesAnyOf: ["artifact", "creature"] } },
    { kind: "permanent", whose: "opponent", filter: { typesAnyOf: ["artifact", "creature"] } },
  ],
  effect: { kind: "exchange-control", objects: [0, 1] },
});
