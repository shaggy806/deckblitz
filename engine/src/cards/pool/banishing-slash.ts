import { defineCard } from "../define.js";

// EDHREC rank 11917.
// Makes Samurai → use "Samurai Token".
//
// Rulings:
//   [2022-02-18] If you control an artifact that is also an enchantment as Banishing Slash
//     resolves, you will create a Samurai token.
//   [2022-02-18] You may cast Banishing Slash without choosing a target. If you do, and you control
//     both an artifact and an enchantment as it resolves, you'll just create a Samurai token.
//     However, if you do choose a target and that target is an illegal target as Banishing Slash
//     tries to resolve, Banishing Slash won't resolve and none of its effects will happen.
//
// The two `controls` checks are independent, so one artifact enchantment
// satisfies both (the first ruling).
const TEXT =
  "Destroy up to one target artifact, enchantment, or tapped creature. Then if you control an artifact and an enchantment, create a 2/2 white Samurai creature token with vigilance.";

export default defineCard({
  name: "Banishing Slash",
  manaCost: "{W}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: TEXT,
  targets: [
    {
      kind: "optional",
      of: {
        kind: "permanent",
        whose: "any",
        filter: { anyOf: [{ type: "artifact" }, { type: "enchantment" }, { type: "creature", tapped: true }] },
      },
    },
  ],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy", target: 0 },
      {
        kind: "conditional",
        condition: {
          kind: "all",
          of: [
            { kind: "controls", filter: { type: "artifact" }, atLeast: 1 },
            { kind: "controls", filter: { type: "enchantment" }, atLeast: 1 },
          ],
        },
        then: { kind: "create-token", token: "Samurai Token", count: 1 },
      },
    ],
  },
});
