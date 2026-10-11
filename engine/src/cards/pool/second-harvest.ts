import { defineCard } from "../define.js";

// Redoubled Stormsinger's `{ each }`: the tokens are fixed as it resolves, a
// stack once per token in it, and a copy made here doesn't count itself.
export default defineCard({
  name: "Second Harvest",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "For each token you control, create a token that's a copy of that permanent.",
  targets: [],
  effect: { kind: "create-token-copy", of: { each: { token: true, controlledBy: "you" } }, count: 1 },
});
