import { defineCard } from "../define.js";

// EDHREC rank 11758.
//
// The count is read as the cast trigger resolves (Hatut Zeraze Strike
// Force's): every cast of each of your commanders from the command zone.

const COPY_TEXT =
  "When you cast this spell, copy it for each time you've cast your commander from the command zone this game. You may choose new targets for the copies.";
const TOKEN_TEXT = "Create a token that's a copy of target artifact.";

export default defineCard({
  name: "Echo Storm",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: `${COPY_TEXT}\n${TOKEN_TEXT}`,
  targets: ["artifact"],
  effect: { kind: "create-token-copy", of: 0, count: 1, who: "you" },
  triggered: [
    {
      trigger: { on: "this-cast" },
      targets: [],
      effect: { kind: "copy-spell", target: "trigger-spell", newTargets: true, count: { commanderCasts: "you" } },
      resolve: null,
      text: COPY_TEXT,
    },
  ],
});
