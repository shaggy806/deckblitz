import { defineCard } from "../define.js";

// EDHREC rank 12274.
//
// Rulings: a life total can't be split up — each of those players gets one
// of the totals back — and you choose which player gets which as it
// resolves. Rules 119.7–8: no higher total for a player who can't gain life,
// no lower one for a player who can't lose it.

const TEXT = "Redistribute any number of players' life totals.";

export default defineCard({
  name: "Reverse the Sands",
  manaCost: "{6}{W}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: `${TEXT} (Each of those players gets one life total back.)`,
  targets: [],
  effect: { kind: "redistribute-life-totals" },
});
