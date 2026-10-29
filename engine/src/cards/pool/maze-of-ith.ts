import { defineCard } from "../define.js";

// EDHREC rank 552.
// Rulings:
//   [2004-10-04] Maze of Ith can target an untapped attacking creature. It will still prevent the
//     combat damage it would deal and be dealt.
//   [2004-10-04] The creature isn't removed from combat; it just has its damage prevented.
//   [2004-10-04] Maze of Ith doesn't have a mana ability.
//
// "To and dealt by" is two `damage-rule`s, recipient and source (Dovin's −1).

const TEXT =
  "{T}: Untap target attacking creature. Prevent all combat damage that would be dealt to and dealt by that creature this turn.";

export default defineCard({
  name: "Maze of Ith",
  colors: [],
  types: ["land"],
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [{ kind: "permanent", filter: { attacking: true, type: "creature" } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "untap", target: 0 },
          { kind: "damage-rule", to: { target: 0 }, combat: true },
          { kind: "damage-rule", by: { target: 0 }, combat: true },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
