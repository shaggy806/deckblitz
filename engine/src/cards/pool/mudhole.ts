import { defineCard } from "../define.js";

// EDHREC rank 29902.

export default defineCard({
  name: "Mudhole",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Target player exiles all land cards from their graveyard.",
  targets: ["player"],
  effect: { kind: "exile-graveyard", target: 0, filter: { type: "land" } },
});
