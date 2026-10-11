import { defineCard } from "../define.js";
import { GIFT_KICKER } from "../helpers.js";

// EDHREC rank 6830.
//
// Rulings:
//   [2024-07-26] For instants and sorceries with gift, the gift is given to the appropriate
//     opponent as part of the resolution of the spell. This happens before any of the spell's
//     other effects would take place.
//   [2024-07-26] Some instant or sorcery spells require alternative or additional targets if the
//     gift was promised. You ignore these targeting requirements if the gifts aren't promised.
//   [2024-07-26] If the target opponent has multiple creatures tied for the greatest power, that
//     player chooses which one to sacrifice.
//
// Gift a card (rule 702.174e). Promised, the spell has a second target — a
// creature card in your graveyard (702.174m, Long River's Pull's shape) — and
// the gift comes first. The edict is Gix's Command's, aimed at the target
// opponent (slot 0) rather than each.
const OPPONENT_SACRIFICES = {
  kind: "sacrifice",
  who: "target",
  filter: { type: "creature", greatestAmongItsController: { of: "power", among: { type: "creature" } } },
  count: 1,
} as const;

export default defineCard({
  name: "Consumed by Greed",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["instant"],
  text:
    "Gift a card (You may promise an opponent a gift as you cast this spell. If you do, they draw a card before its other effects.)\n" +
    "Target opponent sacrifices a creature with the greatest power among creatures they control. If the gift was promised, return target creature card from your graveyard to your hand.",
  targets: ["opponent"],
  effect: OPPONENT_SACRIFICES,
  kicker: {
    ...GIFT_KICKER,
    targets: ["opponent", { kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }],
    effect: {
      kind: "sequence",
      effects: [
        { kind: "gift", gift: "card" },
        OPPONENT_SACRIFICES,
        { kind: "return-to-hand", target: 1, from: "graveyard" },
      ],
    },
  },
});
