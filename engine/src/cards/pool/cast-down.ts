import { defineCard } from "../define.js";

// EDHREC rank 7402.

export default defineCard({
  name: "Cast Down",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Destroy target nonlegendary creature.",
  targets: [{ kind: "permanent", filter: { type: "creature", notSupertype: "legendary" } }],
  effect: { kind: "destroy", target: 0 },
});
