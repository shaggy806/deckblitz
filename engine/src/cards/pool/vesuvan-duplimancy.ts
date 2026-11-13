import { defineCard } from "../define.js";

// EDHREC rank 4014.
//
// Rulings (abridged):
//   If the target of the spell is changed after the triggered ability is put
//   on the stack, the token is a copy of the spell's original target.
//   If that target leaves the battlefield before the ability resolves, use
//   its characteristics as it last existed.
//   The ability resolves before the spell, and a token is created even if
//   the spell was countered or its target is now illegal.
//   The token isn't legendary, and this exception is copiable.
//
// "That artifact or creature" is the spell's target as the ability triggered
// (`{ targetsOf: "trigger-object" }`, kept on the trigger —
// `LastKnownRefs.triggerSpellTargets`).
const TEXT =
  "Whenever you cast a spell that targets only a single artifact or creature you control, create a token that's a copy of that artifact or creature, except it's not legendary.";

export default defineCard({
  name: "Vesuvan Duplimancy",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: {
        on: "cast-spell",
        who: "you",
        filter: {
          targets: { only: true, single: true, permanent: { typesAnyOf: ["artifact", "creature"], controlledBy: "you" } },
        },
      },
      targets: [],
      effect: {
        kind: "create-token-copy",
        of: { targetsOf: "trigger-object" },
        count: 1,
        who: "you",
        exceptions: { removeSupertypes: ["legendary"] },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
