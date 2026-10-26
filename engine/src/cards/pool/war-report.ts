import { defineCard } from "../define.js";

// EDHREC rank 10335. An artifact creature is counted twice (the ruling): once
// in each count.
export default defineCard({
  name: "War Report",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "You gain life equal to the number of creatures on the battlefield plus the number of artifacts on the battlefield.",
  targets: [],
  effect: {
    kind: "gain-life",
    amount: { sum: [{ countOf: { type: "creature" } }, { countOf: { type: "artifact" } }] },
  },
});
