import { defineCard } from "../define.js";

// EDHREC rank 30711.
//
// Rulings:
//   [2024-01-12] Petrahydrox's ability triggers only if it's on the battlefield when it becomes
//     the target of a spell or ability.
//   [2024-01-12] Petrahydrox's ability resolves before the spell or ability that caused it to
//     trigger. It resolves even if that spell or ability is countered.
//   [2024-01-12] If the spell or ability that targets Petrahydrox has no other targets, it won't
//     resolve (because it no longer has a legal target after Petrahydrox has returned to its
//     owner's hand).
const TARGET_TEXT =
  "When this creature becomes the target of a spell or ability, return this creature to its owner's hand.";

export default defineCard({
  name: "Petrahydrox",
  manaCost: "{3}{U/R}",
  colors: ["U", "R"],
  types: ["creature"],
  subtypes: ["Weird"],
  power: 3,
  toughness: 3,
  text: `({U/R} can be paid with either {U} or {R}.)\n${TARGET_TEXT}`,
  triggered: [
    {
      trigger: { on: "becomes-target", who: "self" },
      targets: [],
      effect: { kind: "return-to-hand", target: "source" },
      resolve: null,
      text: TARGET_TEXT,
    },
  ],
});
