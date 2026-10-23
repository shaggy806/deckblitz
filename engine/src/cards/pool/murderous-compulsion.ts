import { defineCard } from "../define.js";

// EDHREC rank 11111.

export default defineCard({
  name: "Murderous Compulsion",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["sorcery"],
  madness: { cost: "{1}{B}" },
  text: "Destroy target tapped creature.\nMadness {1}{B} (If you discard this card, discard it into exile. When you do, cast it for its madness cost or put it into your graveyard.)",
  targets: [{ kind: "permanent", filter: { tapped: true, type: "creature" } }],
  effect: { kind: "destroy", target: 0 },
});
