import { defineCard } from "../define.js";

// EDHREC rank 14224. No engine code: Verdant Mastery's alternative cost and
// condition, Ingenious Mastery's "an opponent" (the caster chooses which as it
// resolves — the ruling; a `choose-opponent`, not a target), and Elrond of the
// White Council's choice by another player (`chooser: "that-player"`, the
// filter read from their side). The two chosen go back together, one
// instruction (`thenTogether`, a `return-to-hand-all` over what was chosen
// this way), before everything nonland is destroyed — so the ones returned
// escape it.
//
// Rulings:
//   [2021-04-16] In a multiplayer game, you choose which opponent takes the prescribed action as
//     the spell resolves.
//   [2021-04-16] If you copy a "Mastery" spell and the alternative cost was paid, the copy will
//     resolve as though the cost was paid.

export default defineCard({
  name: "Devastating Mastery",
  manaCost: "{2}{W}{W}{W}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "You may pay {2}{W}{W} rather than pay this spell's mana cost.\nIf the {2}{W}{W} cost was paid, an opponent chooses up to two nonland permanents they control and returns them to their owner's hand.\nDestroy all nonland permanents.",
  alternativeCost: { mana: "{2}{W}{W}" },
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "conditional",
        condition: { kind: "self-alternative-cost-paid" },
        then: {
          kind: "choose-opponent",
          then: {
            kind: "choose-permanents",
            chooser: "that-player",
            filter: { notTypes: ["land"], controlledBy: "you" },
            upTo: 2,
            thenTogether: true,
            then: { kind: "return-to-hand-all", filter: { thisWay: "chosen" } },
            prompt: "Choose up to two nonland permanents you control to return to their owner's hand",
          },
        },
      },
      { kind: "destroy-all", filter: { notTypes: ["land"] } },
    ],
  },
});
