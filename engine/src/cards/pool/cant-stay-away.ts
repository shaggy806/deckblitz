import { defineCard } from "../define.js";

// EDHREC rank 17213.
//
// "It gains '…'" is a `grant-static` for good (rule 611.2c) on the returned
// permanent: the target slot follows the card onto the battlefield. A granted
// self "exile it instead" works as a printed one does (`Game.ownExileReplacements`
// reads granted statics), and it's gone if the permanent leaves and comes back
// (rule 400.7).

const RETURN =
  'Return target creature card with mana value 3 or less from your graveyard to the battlefield. It gains "If this creature would die, exile it instead."';

export default defineCard({
  name: "Can't Stay Away",
  manaCost: "{W}{B}",
  colors: ["W", "B"],
  types: ["sorcery"],
  flashback: { cost: "{3}{W}{B}" },
  text: `${RETURN}\nFlashback {3}{W}{B} (You may cast this card from your graveyard for its flashback cost. Then exile it.)`,
  targets: [
    {
      kind: "card-in-graveyard",
      whose: "you",
      filter: { type: "creature", manaValue: { op: "lte", n: 3 } },
    },
  ],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "put-onto-battlefield", target: 0, underYourControl: true },
      {
        kind: "grant-static",
        target: 0,
        ability: {
          affects: { scope: "self" },
          replacement: { event: "would-be-put-into-graveyard", instead: "exile", self: true, from: "battlefield" },
          text: "If this creature would die, exile it instead.",
        },
        duration: "permanent",
      },
    ],
  },
});
