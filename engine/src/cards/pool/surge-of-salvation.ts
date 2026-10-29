import { defineCard } from "../define.js";

// EDHREC rank 3068.
// Rulings:
//   [2020-11-10] The set of permanents that gain hexproof is determined as Surge of Salvation
//     resolves. Permanents you begin to control later in the turn won't gain hexproof. However,
//     the damage prevention effect will apply to all creatures you control throughout the turn,
//     even if you didn't control them (or they weren't creatures) as Surge of Salvation resolved.
//
// The hexproof grant is locked in as it resolves; the `damage-rule` asks its
// recipient and source filters as each damage would be dealt (rule 615.1), as
// the ruling says.

export default defineCard({
  name: "Surge of Salvation",
  manaCost: "{W}",
  colors: ["W"],
  types: ["instant"],
  text: "You and permanents you control gain hexproof until end of turn. Prevent all damage that black and/or red sources would deal to creatures you control this turn.",
  effect: {
    kind: "sequence",
    effects: [
      { kind: "grant-player-hexproof", who: "you" },
      { kind: "grant-keyword-all", filter: { controlledBy: "you" }, keyword: "hexproof", duration: "end-of-turn" },
      {
        kind: "damage-rule",
        to: { permanents: { type: "creature", controlledBy: "you" } },
        by: { filter: { anyOf: [{ colors: ["B"] }, { colors: ["R"] }] } },
      },
    ],
  },
});
