import { defineCard } from "../define.js";

// Invasion (INV). EDHREC rank 20571.
//
// Rulings:
//   [2019-06-14] If the target artifact or enchantment is an illegal target by the time
//     Dismantling Blow tries to resolve, the spell doesn't resolve. You won't draw two cards if it
//     was kicked. If the target is legal but not destroyed (most likely because it has
//     indestructible), you do draw two cards.
//   [2024-11-08] If you copy a kicked spell on the stack, the copy is also kicked.
//   [2024-11-08] The kicker ability doesn't let you pay a kicker cost more than once.
export default defineCard({
  name: "Dismantling Blow",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Kicker {2}{U} (You may pay an additional {2}{U} as you cast this spell.)\nDestroy target artifact or enchantment. If this spell was kicked, draw two cards.",
  targets: ["artifact-or-enchantment"],
  effect: { kind: "destroy", target: 0 },
  kicker: {
    cost: "{2}{U}",
    effect: {
      kind: "sequence",
      effects: [
        { kind: "destroy", target: 0 },
        { kind: "draw", amount: 2 },
      ],
    },
  },
});
