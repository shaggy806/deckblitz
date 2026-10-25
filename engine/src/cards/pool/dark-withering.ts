import { defineCard } from "../define.js";

// EDHREC rank 8118.

export default defineCard({
  name: "Dark Withering",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  types: ["instant"],
  madness: { cost: "{B}" },
  text: "Destroy target nonblack creature.\nMadness {B} (If you discard this card, discard it into exile. When you do, cast it for its madness cost or put it into your graveyard.)",
  targets: ["nonblack-creature"],
  effect: { kind: "destroy", target: 0 },
});
