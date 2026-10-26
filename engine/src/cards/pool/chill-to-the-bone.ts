import { defineCard } from "../define.js";

// Coldsnap (CSP). EDHREC rank 21872.

export default defineCard({
  name: "Chill to the Bone",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Destroy target nonsnow creature.",
  targets: [{ kind: "permanent", filter: { type: "creature", notSupertype: "snow" } }],
  effect: { kind: "destroy", target: 0 },
});
