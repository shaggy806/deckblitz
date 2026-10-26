import { defineCard } from "../define.js";

// EDHREC rank 23876.

export default defineCard({
  name: "Assassin's Blade",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Cast this spell only during the declare attackers step and only if you've been attacked this step.\nDestroy target nonblack attacking creature.",
  castOnlyIf: { kind: "attacked-this-step" },
  targets: [{ kind: "permanent", filter: { type: "creature", attacking: true, notColors: ["B"] } }],
  effect: { kind: "destroy", target: 0 },
});
