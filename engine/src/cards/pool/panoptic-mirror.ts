import { defineCard } from "../define.js";

// EDHREC rank 9793. Imprint links the two abilities (rule 607.2a), as
// Isochron Scepter's does. "Copy a card exiled with this artifact. If you
// do, you may cast the copy" is one card of those exiled with it, chosen as
// the trigger resolves: a copy of each is offered and at most one is cast
// (`repeat` with `upTo: 1`). A copy not cast ceases to exist (rule 704.5e)
// without anything having seen it, so declining to copy and declining to
// cast are the same (the rulings: both are optional).
//
// Rulings:
//   You may imprint a card on Panoptic Mirror in response to the upkeep-triggered ability. If
//     you do, that card is available to copy when the triggered ability resolves.
//   Exiling a card when the activated ability resolves is optional. If you choose to exile a
//     card, you can exile only a card with mana value equal to X.
//   You don't pay the spell's mana cost. If the spell has X in its mana cost, X is 0. You do pay
//     any additional costs for that spell. You can't use any alternative costs.
//   The triggered ability triggers only once each upkeep, not once per imprinted card. If no
//     cards are imprinted on Panoptic Mirror when the triggered ability resolves, it does nothing.
//   The creation of the copy and then the casting of the copy are both optional.

const IMPRINT = "Imprint — {X}, {T}: You may exile an instant or sorcery card with mana value X from your hand.";
const UPKEEP =
  "At the beginning of your upkeep, you may copy a card exiled with this artifact. If you do, you may cast the copy without paying its mana cost.";

export default defineCard({
  name: "Panoptic Mirror",
  manaCost: "{5}",
  types: ["artifact"],
  text: `${IMPRINT}\n${UPKEEP}`,
  activated: [
    {
      cost: { mana: "{X}", tap: true },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "hand",
        min: 0,
        max: 1,
        destination: "exile",
        leftover: "stay",
        filter: { typesAnyOf: ["instant", "sorcery"], manaValue: { op: "eq", n: { amount: "x" } } },
      },
      resolve: null,
      text: IMPRINT,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "cast-now", from: "exiled-with-source", copies: 1, repeat: true, upTo: 1, free: true },
      resolve: null,
      text: UPKEEP,
    },
  ],
});
