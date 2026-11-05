import { defineCard } from "../define.js";

// EDHREC rank 6440.

export default defineCard({
  name: "Lapse of Certainty",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Counter target spell. If that spell is countered this way, put it on top of its owner's library instead of into that player's graveyard.",
  targets: ["spell"],
  effect: { kind: "counter", target: 0, into: "library-top" },
});
