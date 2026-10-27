import { defineCard } from "../define.js";

// EDHREC rank 12787.

export default defineCard({
  name: "Deluge",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Tap all creatures without flying.",
  targets: [],
  effect: { kind: "tap-all", filter: { type: "creature", notKeyword: "flying" } },
});
