import { defineCard } from "../define.js";

// Urza's Saga (USG). EDHREC rank 20725. Terror with cycling.

export default defineCard({
  name: "Expunge",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["instant"],
  cycling: { cost: "{2}" },
  text: "Destroy target nonartifact, nonblack creature. It can't be regenerated.\nCycling {2} ({2}, Discard this card: Draw a card.)",
  targets: [{ kind: "permanent", filter: { type: "creature", notTypes: ["artifact"], notColors: ["B"] } }],
  effect: { kind: "destroy", target: 0, cantBeRegenerated: true },
});
