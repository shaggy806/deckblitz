import { defineCard } from "../define.js";

// EDHREC rank 22777.
//
// Rulings:
//   [2010-03-01] If the targeted creature is an illegal target as Dead Reckoning resolves (because
//     it’s no longer on the battlefield, perhaps), you may still put the targeted creature card
//     from your graveyard on top of your library. No damage will be dealt.
//   [2010-03-01] Dead Reckoning deals damage equal to the power the creature card had while it was
//     in your graveyard. This could matter if that card is something like Lord of Extinction or
//     Tarmogoyf whose power is determined by a characteristic-defining ability that checks the
//     contents of your graveyard.
//   [2010-03-01] You must choose two targets as you cast Dead Reckoning: a creature card in your
//     graveyard and a creature on the battlefield. If you can’t, then you can’t cast the spell.
//   [2010-03-01] If the targeted creature card is an illegal target as Dead Reckoning resolves
//     (because it’s no longer in your graveyard, perhaps), you can’t choose to put it on top of
//     your library. No damage will be dealt.
//
// Lie in Wait's shape, behind a `may` whose `then` is the "if you do".

export default defineCard({
  name: "Dead Reckoning",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "You may put target creature card from your graveyard on top of your library. If you do, Dead Reckoning deals damage equal to that card's power to target creature.",
  targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }, "creature"],
  effect: {
    kind: "may",
    prompt: "Put the creature card on top of your library?",
    effect: { kind: "put-on-library", target: 0, position: "top" },
    then: { kind: "damage", amount: { powerOf: 0 }, target: 1 },
  },
});
