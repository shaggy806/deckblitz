import { defineCard } from "../define.js";

// EDHREC rank 15668.
//
// Rulings:
//   [2023-11-03] If Mordor on the March creates multiple tokens due to a replacement effect (such
//     as the one Doubling Season creates), each of those tokens will gain haste, and you'll exile
//     each of them at the beginning of the next end step.
//   [2023-11-03] The token copies exactly what was printed on the original creature card and
//     nothing else.
//   [2023-11-03] The copies of Mordor on the March created by its storm ability are put directly
//     onto the stack. They aren't cast and won't be counted by other spells with storm cast later
//     in the turn.
//
// "Exile a creature card from your graveyard" isn't a target: the card is
// chosen as the spell (or each storm copy) resolves.

const TEXT =
  "Exile a creature card from your graveyard. Create a token that's a copy of it. It gains haste until end of turn. Exile it at the beginning of the next end step.";

export default defineCard({
  name: "Mordor on the March",
  manaCost: "{3}{B}{R}",
  colors: ["B", "R"],
  types: ["sorcery"],
  text: `${TEXT}\nStorm (When you cast this spell, copy it for each spell cast before it this turn.)`,
  targets: [],
  effect: {
    kind: "look-and-choose",
    zone: "graveyard",
    filter: { type: "creature" },
    min: 1,
    max: 1,
    destination: "exile",
    leftover: "stay",
    then: {
      kind: "sequence",
      effects: [
        { kind: "create-token-copy", of: 0, count: 1, who: "you", gainUntilEndOfTurn: ["haste"] },
        {
          kind: "delayed-trigger",
          at: "next-end-step",
          about: "created",
          effect: { kind: "for-each-target", from: 0, effect: { kind: "exile", target: 0 } },
          text: "Exile it at the beginning of the next end step.",
        },
      ],
    },
  },
  triggered: [
    {
      trigger: { on: "this-cast" },
      targets: [],
      effect: { kind: "storm" },
      resolve: null,
      text: "Storm",
    },
  ],
});
