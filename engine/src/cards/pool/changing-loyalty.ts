import { defineCard } from "../define.js";

// EDHREC rank 6335.
//
// Rulings:
//   [2026-03-20] The copies that replicate creates are created on the stack, so they're not
//     "cast." Abilities that trigger when a player casts a spell won't trigger.
//   [2026-03-20] The replicate triggered ability that creates the copies can itself be countered
//     by anything that can counter a triggered ability. If the ability countered, no copies will
//     be put onto the stack.
//   [2026-03-20] A copy of a spell can be countered like any other spell, but it must be countered
//     individually. Countering a spell with replicate won't affect the copies.
//   [2026-03-20] As the replicate triggered ability resolves, you'll copy Changing Loyalty for
//     each time you paid its replicate cost, even if the original spell is no longer on the stack
//     at that time (perhaps because it was countered).
//
// Replicate is Train of Thought's (`keyword: "replicate"`, `multi: true`); a
// copy of a permanent spell becomes a token as it resolves (rule 608.3f), so
// each copy is a token Aura on the creature it targeted. The dies trigger is
// False Demise's.

const DIES_TEXT = "When enchanted creature dies, return it to the battlefield under your control.";

export default defineCard({
  name: "Changing Loyalty",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  keywords: ["flash"],
  text: `Flash\nReplicate {2} (When you cast this spell, copy it for each time you paid its replicate cost. You may choose new targets for the copies. Copies become tokens.)\nEnchant creature\n${DIES_TEXT}`,
  kicker: { cost: "{2}", keyword: "replicate", multi: true },
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "dies", who: "attached" },
      targets: [],
      effect: { kind: "put-onto-battlefield", target: "trigger-object", underYourControl: true },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
