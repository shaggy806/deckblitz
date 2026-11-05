import { defineCard } from "../define.js";

export default defineCard({
  name: "Tombfire",
  manaCost: "{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Target player exiles all cards with flashback from their graveyard.",
  targets: ["player"],
  effect: { kind: "exile-graveyard", target: 0, filter: { hasFlashback: true } },
});
