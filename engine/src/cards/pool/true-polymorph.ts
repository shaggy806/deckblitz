import { defineCard } from "../define.js";

// EDHREC rank 17345. A copy effect (rule 707.2, layer 1) with no duration: it
// lasts as long as the first target stays on the battlefield (the ruling).
// "Another" is a second slot that can't be the first; with either target
// illegal as it resolves, nothing is copied (the ruling — the `become-copy`
// needs both).
//
// Rulings:
//   [2021-07-23] True Polymorph causes the first target permanent to copy the printed values of
//     the second target permanent, including any copy and mutate effects that have been applied to
//     it. It won't copy counters on that permanent or effects that have changed its power,
//     toughness, types, color, and so on.
//   [2021-07-23] If either target is an illegal target for True Polymorph as it resolves, the
//     spell will do nothing.

export default defineCard({
  name: "True Polymorph",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Target artifact or creature becomes a copy of another target artifact or creature.",
  targets: [
    { kind: "permanent", filter: { typesAnyOf: ["artifact", "creature"] } },
    {
      kind: "other",
      of: { kind: "permanent", filter: { typesAnyOf: ["artifact", "creature"] } },
      than: { slots: [0] },
    },
  ],
  effect: { kind: "become-copy", target: 0, of: 1 },
});
