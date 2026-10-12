import { defineCard } from "../define.js";

export default defineCard({
  name: "Hero's Demise",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Destroy target legendary creature.",
  targets: [{ kind: "permanent", filter: { supertype: "legendary", type: "creature" } }],
  effect: { kind: "destroy", target: 0 },
});
