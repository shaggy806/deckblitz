import { defineCard } from "../define.js";
import { GIFT_KICKER } from "../helpers.js";

// EDHREC rank 17141.
//
// Rulings:
//   [2024-07-26] If the gift was promised and the target is illegal as Wildfire Howl tries to
//     resolve, it won’t resolve and none of its effects will happen. No creatures will be dealt
//     damage.
//   [2024-07-26] Some instant or sorcery spells require alternative or additional targets if the
//     gift was promised. You ignore these targeting requirements if the gifts aren’t promised for
//     those spells. On the other hand, you can promise a gift for a permanent spell even if you
//     won’t be able to choose targets for an enters ability of that permanent once the spell
//     resolves.
//   [2024-07-26] For permanent spells with gift, an ability triggers when that permanent enters if
//     the gift was promised. When that ability resolves, the gift is given to the appropriate
//     opponent.
//   [2024-07-26] For instants and sorceries with gift, the gift is given to the appropriate
//     opponent as part of the resolution of the spell. This happens before any of the spell’s
//     other effects would take place.
//   [2024-07-26] As an additional cost to cast a spell with gift, you can promise the listed gift
//     to an opponent. That opponent is chosen as part of that additional cost. The gift isn’t
//     given at this time; rather, it’s given at a later time based on whether or not the spell is
//     a permanent spell.
//   [2024-07-26] If a spell for which the gift was promised is countered, doesn’t resolve (perhaps
//     because all of its targets are illegal), or is otherwise removed from the stack, the gift
//     won’t be given. None of its other effects will happen either.
//   [2024-07-26] If you copy a spell for which the gift was promised, the gift was also promised
//     to the same opponent for the copy. If a card or token enters as a copy of a permanent that’s
//     already on the battlefield, the gift isn’t promised for that new permanent, even if it was
//     promised for the original.
//   [2024-07-26] In the main set, there are four different kinds of gifts. “Gift a Food” causes
//     the chosen opponent to create a Food token, while “Gift a Treasure” causes the chosen
//     opponent to create a Treasure token. “Gift a card” causes them to draw a card, and “Gift a
//     tapped Fish” causes them to create a tapped 1/1 blue Fish creature token. The Commander
//     decks contain two more kinds of gifts: “Gift an Octopus,” which causes the chosen opponent
//     to create an 8/8 blue Octopus creature token, and “Gift an extra turn,” which causes them to
//     take an extra turn after the current turn ends.
//   [2024-07-26] You can’t pay a gift cost more than once.

// Promised, the gift comes first (702.174j), and the 1 to any target and the
// 2 to each creature are one damage event (`simultaneous`): a targeted
// creature is dealt 3 at once, triggering a "whenever it's dealt damage"
// ability once. The target slot exists only when the gift is promised
// (702.174m, the ruling), and an illegal one stops the whole spell.
export default defineCard({
  name: "Wildfire Howl",
  manaCost: "{1}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Gift a card (You may promise an opponent a gift as you cast this spell. If you do, they draw a card before its other effects.)\nWildfire Howl deals 2 damage to each creature. If the gift was promised, instead Wildfire Howl deals 1 damage to any target and 2 damage to each creature.",
  effect: { kind: "damage-all", amount: 2, filter: { type: "creature" } },
  kicker: {
    ...GIFT_KICKER,
    targets: ["any-target"],
    effect: {
      kind: "sequence",
      effects: [
        { kind: "gift", gift: "card" },
        {
          kind: "sequence",
          simultaneous: true,
          effects: [
            { kind: "damage", amount: 1, target: 0 },
            { kind: "damage-all", amount: 2, filter: { type: "creature" } },
          ],
        },
      ],
    },
  },
});
