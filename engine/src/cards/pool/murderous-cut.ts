import { defineCard } from "../define.js";

// EDHREC rank 8343.

export default defineCard({
  name: "Murderous Cut",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Delve (Each card you exile from your graveyard while casting this spell pays for {1}.)\nDestroy target creature.",
  delve: true,
  targets: ["creature"],
  effect: { kind: "destroy", target: 0 },
});
