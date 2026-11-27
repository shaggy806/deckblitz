import { defineCard } from "../define.js";

const FACES = ["Trial // Error", "Trial", "Error"];

export default defineCard({
  name: "Trial",
  manaCost: "{W}{U}",
  colors: ["W", "U"],
  types: ["instant"],
  text: "Return all creatures blocking or blocked by target creature to their owner's hand.",
  targets: ["creature"],
  // "Blocking or blocked by" the creature in target slot 0, read as it
  // resolves (rule 608.2h).
  effect: {
    kind: "return-to-hand-all",
    filter: { type: "creature", blockingRelation: { relation: "either", of: 0 } },
  },
  faces: FACES,
  split: true,
});
