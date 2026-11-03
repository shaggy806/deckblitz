import { defineCard } from "../define.js";

// Mirage. The way out is `doing`, offered only with a card in hand (`mayBeDone`).
// "Discards a card this way" is `this-way`, so an empty hand, which discards
// nothing, deals no damage.

const TEXT =
  "{1}{B}{B}, {T}: Target player discards a card unless they put a card from their hand on top of their library. If that player discards a card this way, this creature deals 1 damage to each creature and each player. Activate only as a sorcery.";

export default defineCard({
  name: "Tainted Specter",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Specter"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  activated: [
    {
      cost: { mana: "{1}{B}{B}", tap: true },
      sorcerySpeed: true,
      targets: ["player"],
      effect: {
        kind: "unless",
        chooser: 0,
        options: [
          {
            doing: {
              kind: "look-and-choose",
              zone: "hand",
              min: 1,
              max: 1,
              destination: "library-top",
              leftover: "stay",
            },
            text: "Put a card from your hand on top of your library",
          },
        ],
        otherwise: {
          kind: "sequence",
          effects: [
            { kind: "discard", target: 0, amount: 1 },
            {
              kind: "conditional",
              condition: { kind: "this-way", what: "discarded" },
              then: {
                kind: "sequence",
                simultaneous: true,
                effects: [
                  { kind: "damage-all", filter: { type: "creature" }, amount: 1 },
                  { kind: "damage", amount: 1, who: "each-player" },
                ],
              },
            },
          ],
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
