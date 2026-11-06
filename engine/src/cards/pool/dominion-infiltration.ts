import { defineCard } from "../define.js";

// EDHREC rank 32256.
//
// "Except it has changeling" is a copy exception (rule 707.9a); "those tokens
// gain haste" isn't, so a copy of one of them doesn't have haste.

export default defineCard({
  name: "Dominion Infiltration",
  manaCost: "{X}{R}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Choose X target creatures your opponents control. For each of them, create a token that's a copy of that creature, except it has changeling. Those tokens gain haste. Exile those tokens at the beginning of the next end step. (They're every creature type.)",
  targets: [{ kind: "any-number", of: "creature-an-opponent-controls", min: "x", max: "x" }],
  effect: {
    kind: "for-each-target",
    from: 0,
    effect: {
      kind: "create-token-copy",
      of: 0,
      count: 1,
      who: "you",
      exceptions: { keywords: ["changeling"] },
      gains: { keywords: ["haste"] },
      exileAtEndStep: true,
    },
  },
});
