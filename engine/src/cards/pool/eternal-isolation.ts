import { defineCard } from "../define.js";

export default defineCard({
  name: "Eternal Isolation",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Put target creature with power 4 or greater on the bottom of its owner's library.",
  targets: [{ kind: "permanent", filter: { type: "creature", power: { op: "gte", n: 4 } } }],
  effect: { kind: "put-on-bottom-of-library", target: 0 },
});
