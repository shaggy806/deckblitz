import { defineCard } from "../define.js";

// Rulings:
//   [2021-04-16] If Containment Breach resolves, and the target artifact has a mana value of 2 or
//     less, but it wasn't destroyed (perhaps because it has indestructible), you will still create
//     a Pest.
//   [2021-04-16] If the artifact or enchantment is an illegal target as Containment Breach tries
//     to resolve, it won't resolve and none of its effects will happen. You won't create a Pest.
//
// The mana value is read before the destroy, which is the same value the
// permanent last had on the battlefield — and still creates the Pest when
// the destroy does nothing (indestructible).

export default defineCard({
  name: "Containment Breach",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["sorcery"],
  subtypes: ["Lesson"],
  text: "Destroy target artifact or enchantment. If its mana value is 2 or less, create a 1/1 black and green Pest creature token with \"When this token dies, you gain 1 life.\"",
  targets: ["artifact-or-enchantment"],
  effect: {
    kind: "conditional",
    condition: { kind: "target", index: 0, filter: { manaValue: { op: "lte", n: 2 } } },
    then: {
      kind: "sequence",
      effects: [
        { kind: "destroy", target: 0 },
        { kind: "create-token", token: "Pest Token", count: 1 },
      ],
    },
    else: { kind: "destroy", target: 0 },
  },
});
