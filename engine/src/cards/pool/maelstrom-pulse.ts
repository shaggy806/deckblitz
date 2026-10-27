import { defineCard } from "../define.js";

// EDHREC rank 3698.
//
// One target; its namesakes (rule 201.2a) aren't targeted, so hexproof or
// protection doesn't save them, and they're destroyed in the same event as
// the target (`CardFilter.sameNameAsTarget`) — an indestructible target still
// takes the others with it (the ruling). An illegal target: nothing happens.

export default defineCard({
  name: "Maelstrom Pulse",
  manaCost: "{1}{B}{G}",
  colors: ["B", "G"],
  types: ["sorcery"],
  text: "Destroy target nonland permanent and all other permanents with the same name as that permanent.",
  targets: ["nonland-permanent"],
  effect: { kind: "destroy-all", filter: { sameNameAsTarget: 0 } },
});
