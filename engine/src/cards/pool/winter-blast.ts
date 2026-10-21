import { defineCard } from "../define.js";

// Legends. EDHREC rank 26868.
//
// Rulings:
//   [2007-09-16] Winter Blast can target tapped creatures. If they have flying, the second part of
//     the effect will still affect them.
//   [2007-09-16] Checks if the creatures are Flying on resolution and not on announcement. It's
//     not a targeting restriction.
//
// Exactly X targets (Part Water's `min`/`max: "x"`). Every target is tapped,
// then each one that has flying as the spell resolves is dealt 2 damage — a
// resolution check (`conditional` on the bound target), not a target filter.

export default defineCard({
  name: "Winter Blast",
  manaCost: "{X}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Tap X target creatures. Winter Blast deals 2 damage to each of those creatures with flying.",
  targets: [{ kind: "any-number", of: "creature", min: "x", max: "x" }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "for-each-target", from: 0, effect: { kind: "tap", target: 0 } },
      // One damage event to all the fliers (rule 120.3).
      {
        kind: "for-each-target",
        from: 0,
        simultaneous: true,
        effect: {
          kind: "conditional",
          condition: { kind: "target", index: 0, filter: { keyword: "flying" } },
          then: { kind: "damage", amount: 2, target: 0 },
        },
      },
    ],
  },
});
