import { defineCard } from "../define.js";

// EDHREC rank 28825.

export default defineCard({
  name: "Saltblast",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Destroy target nonwhite permanent.",
  targets: [{ kind: "permanent", filter: { notColors: ["W"] } }],
  effect: { kind: "destroy", target: 0 },
});
