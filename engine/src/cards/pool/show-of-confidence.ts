import { defineCard } from "../define.js";

// Rulings:
//   [2021-04-16] Magecraft abilities trigger once for each copy created as Show of Confidence’s
//     triggered ability resolves.
//   [2021-04-16] The triggered ability counts all instants and sorceries that were cast before it
//     resolves. If you cast instant spells in response to the ability, those spells will count.
//   [2021-04-16] If the target of the original Show of Confidence has become an illegal target
//     when that spell is copied, the copies will initially still target the same creature. If you
//     don’t choose new targets for the copies, they each will fail to resolve.
//
// The count is read as the trigger resolves (its ruling): every instant and
// sorcery you've cast this turn, less Show of Confidence itself.

export default defineCard({
  name: "Show of Confidence",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "When you cast this spell, copy it for each other instant and sorcery spell you've cast this turn. You may choose new targets for the copies.\nPut a +1/+1 counter on target creature. It gains vigilance until end of turn.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      { kind: "grant-keyword", target: 0, keyword: "vigilance", duration: "end-of-turn" },
    ],
  },
  triggered: [
    {
      trigger: { on: "this-cast" },
      targets: [],
      effect: {
        kind: "copy-spell",
        target: "trigger-spell",
        newTargets: true,
        count: { difference: [{ castThisTurn: { typesAnyOf: ["instant", "sorcery"] } }, 1] },
      },
      resolve: null,
      text: "When you cast this spell, copy it for each other instant and sorcery spell you've cast this turn. You may choose new targets for the copies.",
    },
  ],
});
