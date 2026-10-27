import { defineCard } from "../define.js";

// Champions of Kamigawa. EDHREC rank 32231. Any Spirit permanent.

export default defineCard({
  name: "Rend Spirit",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Destroy target Spirit.",
  targets: [{ kind: "permanent", filter: { subtype: "Spirit" } }],
  effect: { kind: "destroy", target: 0 },
});
