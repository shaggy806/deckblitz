import { defineCard } from "../define.js";

// Avacyn Restored. "The second spell cast this turn" counts every player's
// spells in the order they were cast, the countered ones too; a copy was
// never cast, so it's never the second (`castNthThisTurn`).

export default defineCard({
  name: "Second Guess",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Counter target spell that's the second spell cast this turn.",
  targets: [{ kind: "spell", filter: { castNthThisTurn: { n: 2 } } }],
  effect: { kind: "counter", target: 0 },
});
