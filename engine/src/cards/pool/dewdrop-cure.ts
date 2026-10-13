import type { TargetSpec } from "../../target.js";
import { defineCard } from "../define.js";
import { distinctTargets, GIFT_KICKER } from "../helpers.js";

// EDHREC rank 7487.
//
// Rulings:
//   [2024-07-26] If a card in a graveyard has {X} in its mana cost, X is 0 for the purpose of
//     determining its mana value.
//   [2024-07-26] Some instant or sorcery spells require alternative or additional targets if the
//     gift was promised. You ignore these targeting requirements if the gifts aren't promised for
//     those spells.

// Gift a card (rule 702.174e). The promise changes how many targets it takes
// (702.174m), so the promised cast is its own variant with three slots.
const SMALL_CREATURE: TargetSpec = {
  kind: "card-in-graveyard",
  whose: "you",
  filter: { type: "creature", manaValue: { op: "lte", n: 2 } },
};

export default defineCard({
  name: "Dewdrop Cure",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text:
    "Gift a card (You may promise an opponent a gift as you cast this spell. If you do, they draw a card before its other effects.)\n" +
    "Return up to two target creature cards each with mana value 2 or less from your graveyard to the battlefield. If the gift was promised, instead return up to three target creature cards each with mana value 2 or less from your graveyard to the battlefield.",
  targets: distinctTargets(2, SMALL_CREATURE, { optional: true }),
  effect: {
    kind: "sequence",
    simultaneous: true,
    effects: [
      { kind: "put-onto-battlefield", target: 0 },
      { kind: "put-onto-battlefield", target: 1 },
    ],
  },
  kicker: {
    ...GIFT_KICKER,
    targets: distinctTargets(3, SMALL_CREATURE, { optional: true }),
    effect: {
      kind: "sequence",
      effects: [
        { kind: "gift", gift: "card" },
        {
          kind: "sequence",
          simultaneous: true,
          effects: [
            { kind: "put-onto-battlefield", target: 0 },
            { kind: "put-onto-battlefield", target: 1 },
            { kind: "put-onto-battlefield", target: 2 },
          ],
        },
      ],
    },
  },
});
