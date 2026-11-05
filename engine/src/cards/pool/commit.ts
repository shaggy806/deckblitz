import { defineCard } from "../define.js";

// The first half of Commit // Memory. A spell put into a library is removed from
// the stack, neither countered nor resolved (the ruling).
const FACES = ["Commit // Memory", "Commit", "Memory"];

export default defineCard({
  name: "Commit",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Put target spell or nonland permanent into its owner's library second from the top.",
  targets: [{ kind: "spell-or-permanent", filter: { notTypes: ["land"] } }],
  effect: { kind: "put-on-library", target: 0, position: { fromTop: 2 } },
  faces: FACES,
  split: true,
});
