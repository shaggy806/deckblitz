import { defineCard } from "../define.js";

// EDHREC rank 13514.
//
// The cards are targeted, the player isn't: a player is chosen as it's
// activated — the targets' own, all from one graveyard — and with no
// targets still chosen, then drawing at the next upkeep (its ruling;
// `namesPlayer`). "In any order": they go on in the order chosen, so the
// last one chosen ends on top (Misinformation's shape). The draw is a
// delayed ability, "that player" kept from when it was made.

const TEXT =
  "{1}, {T}, Sacrifice this artifact: Put up to four target basic land cards from a player's graveyard on top of their library in any order. That player draws a card at the beginning of the next turn's upkeep.";

export default defineCard({
  name: "Lodestone Bauble",
  manaCost: "{0}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{1}", tap: true, sacrifice: "self" },
      targets: [
        {
          kind: "any-number",
          of: { kind: "card-in-graveyard", filter: { type: "land", supertype: "basic" } },
          max: 4,
          sameController: true,
        },
      ],
      namesPlayer: { group: 0 },
      effect: {
        kind: "sequence",
        effects: [
          { kind: "for-each-target", from: 0, simultaneous: true, effect: { kind: "put-on-library", target: 0, position: "top" } },
          {
            kind: "delayed-trigger",
            at: { step: "upkeep" },
            text: "That player draws a card.",
            effect: { kind: "draw", amount: 1, who: "that-player" },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
