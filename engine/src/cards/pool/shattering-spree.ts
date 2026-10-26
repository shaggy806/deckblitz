import { defineCard } from "../define.js";

// Replicate (rule 702.56a): `kicker` with `keyword: "replicate"`, paid any
// number of times; one cast trigger copies it that many times.
//
// EDHREC rank 7946. Guildpact.
//
// Rulings:
//   [2024-01-12] As the replicate triggered ability resolves, you'll copy Shattering Spree for
//     each time you paid its replicate cost, even if the original spell is no longer on the stack
//     at that time (perhaps because it was countered).
//   [2024-01-12] The copies that replicate creates are created on the stack, so they're not
//     "cast." Abilities that trigger when a player casts a spell won't trigger.

export default defineCard({
  name: "Shattering Spree",
  manaCost: "{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Replicate {R} (When you cast this spell, copy it for each time you paid its replicate cost. You may choose new targets for the copies.)\nDestroy target artifact.",
  kicker: { cost: "{R}", keyword: "replicate", multi: true },
  targets: ["artifact"],
  effect: { kind: "destroy", target: 0 },
});
