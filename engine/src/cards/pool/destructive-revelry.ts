import { defineCard } from "../define.js";

// EDHREC rank 10728.
//
// Rulings:
//   [2013-09-15] You must target an artifact or enchantment to cast Destructive Revelry. If that
//     artifact or enchantment is an illegal target when Destructive Revelry tries to resolve, it
//     won't resolve and none of its effects will happen. No damage will be dealt. However, if
//     Destructive Revelry resolves and the artifact or enchantment isn't destroyed (perhaps
//     because it has indestructible), damage will be dealt.

// Cindervines' shape: the damage goes to the controller as the permanent last
// existed, whether or not it was destroyed.
export default defineCard({
  name: "Destructive Revelry",
  manaCost: "{R}{G}",
  colors: ["R", "G"],
  types: ["instant"],
  text: "Destroy target artifact or enchantment. Destructive Revelry deals 2 damage to that permanent's controller.",
  targets: ["artifact-or-enchantment"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy", target: 0 },
      { kind: "damage", amount: 2, toControllerOfTarget: 0 },
    ],
  },
});
