import { defineCard } from "../define.js";

// EDHREC rank 6502.
// A delayed triggered ability for the rest of the turn (rule 603.7c): each
// nontoken creature entering under an opponent's control is copied, the
// token yours.
const TEXT =
  "Whenever a nontoken creature an opponent controls enters this turn, create a token that's a copy of that creature.";

export default defineCard({
  name: "Theoretical Duplication",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["instant"],
  text: TEXT,
  targets: [],
  effect: {
    kind: "delayed-trigger",
    at: { whenever: { on: "enters-battlefield", who: "opponent", filter: { type: "creature", token: false } } },
    effect: { kind: "create-token-copy", of: "trigger-object", count: 1, who: "you" },
    text: TEXT,
  },
});
