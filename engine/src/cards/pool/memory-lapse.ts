import { defineCard } from "../define.js";

// `into` is still a counter: a spell that can't be countered stays where it is
// and resolves.
export default defineCard({
  name: "Memory Lapse",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Counter target spell. If that spell is countered this way, put it on top of its owner's library instead of into that player's graveyard.",
  targets: ["spell"],
  effect: { kind: "counter", target: 0, into: "library-top" },
});
