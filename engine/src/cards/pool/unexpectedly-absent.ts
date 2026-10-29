import { defineCard } from "../define.js";

// Eldritch Moon (EMN). EDHREC rank 13817.
//
// X = 0 puts it on top; a library of X or fewer cards takes it on the bottom
// (the rulings — `beneathTop` reads as `fromTop: X + 1`).
export default defineCard({
  name: "Unexpectedly Absent",
  manaCost: "{X}{W}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Put target nonland permanent into its owner's library just beneath the top X cards of that library.",
  targets: ["nonland-permanent"],
  effect: { kind: "put-on-library", target: 0, position: { beneathTop: "x" } },
});
