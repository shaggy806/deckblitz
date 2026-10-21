import { defineCard } from "../define.js";

// EDHREC rank 23618.

export default defineCard({
  name: "Forced Landing",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Put target creature with flying on the bottom of its owner's library.",
  targets: [{ kind: "permanent", whose: "any", filter: { type: "creature", keyword: "flying" } }],
  effect: { kind: "put-on-bottom-of-library", target: 0 },
});
