import { defineCard } from "../define.js";

// EDHREC rank 16943.
//
// Rulings:
//   [2022-12-08] If Orim's Thunder is kicked, but the artifact or enchantment is an illegal target
//     as Orim's Thunder tries to resolve, Orim's Thunder won't be able to determine the artifact
//     or enchantment's mana value. No damage will be dealt to the target creature, even if it
//     remained a legal target. If only the creature has become an illegal target, the artifact or
//     enchantment will still be destroyed. (If both targets become illegal, Orim's Thunder won't
//     resolve at all.)
//   [2022-12-08] If Orim's Thunder is kicked, it's the source of damage dealt to the target
//     creature, not the artifact or enchantment.
//
// Kicked, the spell has a second target (Mind Spiral's shape). The mana value
// is read from slot 0 after the destroy (last known information); an illegal
// slot 0 reads as nothing, so no damage — the first ruling.

const DESTROY = { kind: "destroy", target: 0 } as const;

export default defineCard({
  name: "Orim's Thunder",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Kicker {R} (You may pay an additional {R} as you cast this spell.)\nDestroy target artifact or enchantment. If this spell was kicked, it deals damage equal to that permanent's mana value to target creature.",
  targets: ["artifact-or-enchantment"],
  effect: DESTROY,
  kicker: {
    cost: "{R}",
    targets: ["artifact-or-enchantment", "creature"],
    effect: {
      kind: "sequence",
      effects: [DESTROY, { kind: "damage", amount: { manaValueOf: 0 }, target: 1 }],
    },
  },
});
