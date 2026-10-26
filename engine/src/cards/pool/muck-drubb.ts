import { defineCard } from "../define.js";

// EDHREC rank 14804.
//
// Rulings:
//   - The spell's target is changed to Muck Drubb only if Muck Drubb is a legal target for that
//     spell.
//   - If a spell has multiple targets but it's targeting the same creature with all of them, you
//     can target that spell with Muck Drubb's ability. In that case, you change all of those
//     targets to Muck Drubb.
//   - If a spell has multiple targets, you can't target it with Muck Drubb's ability, even if
//     only one of those targets is a creature or all but one of those targets have become
//     illegal.

const TEXT =
  "When this creature enters, change the target of target spell that targets only a single creature to this creature.";

export default defineCard({
  name: "Muck Drubb",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 3,
  toughness: 3,
  keywords: ["flash"],
  madness: { cost: "{2}{B}" },
  text: `Flash\n${TEXT}\nMadness {2}{B} (If you discard this card, discard it into exile. When you do, cast it for its madness cost or put it into your graveyard.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      // Ivy, Gleeful Spellthief's "targets only a single creature": one
      // object in every slot, and a creature.
      targets: [
        {
          kind: "spell",
          filter: { targets: { only: true, single: true, permanent: { type: "creature" } } },
        },
      ],
      effect: { kind: "change-targets", target: 0, how: "change", to: "source" },
      resolve: null,
      text: TEXT,
    },
  ],
});
