import { defineCard } from "../define.js";

// Amonkhet (AKH). EDHREC rank 8885. Cycling is discarding (rule 702.29a), so
// "cycled or discarded" is every card you discarded this turn for any reason
// still in your graveyard as the card it went there as; a madness card you
// didn't cast went there through exile and still counts (the rulings).

export default defineCard({
  name: "Shadow of the Grave",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Return to your hand all cards in your graveyard that you cycled or discarded this turn.",
  targets: [],
  effect: { kind: "return-from-graveyard", filter: { discardedThisTurn: true }, destination: "hand", count: "all" },
});
