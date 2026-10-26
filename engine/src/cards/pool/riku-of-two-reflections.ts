import { defineCard } from "../define.js";

// EDHREC rank 12352.
//
// Rulings:
//   [2011-09-22] If the copied spell is modal (that is, it says “Choose one —” or the like), the
//     copy has the same mode as the original spell. You can't choose a different one.
//   [2011-09-22] The copiable values of the token's characteristics are the same as the copiable
//     values of the characteristics of the creature it's copying.
//   [2011-09-22] If the creature had {X} in its mana cost, X must be 0. Note this is different
//     from an {X} found in the mana cost of a copied spell.
//   [2011-09-22] If the creature that caused Riku's second ability to trigger has already left the
//     battlefield by the time the ability resolves, you can still pay {G}{U}. If you do, you'll
//     still put a token onto the battlefield. That token has the copiable values of the
//     characteristics of that creature as it last existed on the battlefield.
//   [2011-09-22] If the copied spell has {X} in its mana cost, the value of X is copied.
//   [2011-09-22] Each time the first ability triggers, you can pay {U}{R} only one time to get one
//     copy of the spell. Each time the second ability triggers, you can pay {G}{U} only one time
//     to get one token.
//   [2011-09-22] As the token is created, it checks the printed values of the creature it's
//     copying, as well as any copy effects that have been applied to it.
//   [2011-09-22] If the spell that caused Riku's first ability to trigger has left the stack by
//     the time the ability resolves, you can still pay {U}{R}. If you do, you'll copy the spell as
//     it last existed on the stack.
//   [2011-09-22] You can't pay any additional costs for the copy. However, effects based on any
//     additional costs paid for the original spell are copied as though those same costs were paid
//     for the copy. Notably, if the original spell was kicked (or kicked a certain number of
//     times), the copy will also be kicked (or kicked that many times).
//   [2011-09-22] Riku's first ability triggers whenever you cast any instant or sorcery spell,
//     regardless of whether that spell has targets.
//
// Rowan, Scholar of Sparks' emblem shape for the first ability, Mirrorworks'
// for the second (the copy read off the creature as it last existed).

const COPY_SPELL =
  "Whenever you cast an instant or sorcery spell, you may pay {U}{R}. If you do, copy that spell. You may choose new targets for the copy.";
const COPY_CREATURE =
  "Whenever another nontoken creature you control enters, you may pay {G}{U}. If you do, create a token that's a copy of that creature.";

export default defineCard({
  name: "Riku of Two Reflections",
  manaCost: "{2}{G}{U}{R}",
  colors: ["U", "R", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 2,
  text: `${COPY_SPELL}\n${COPY_CREATURE}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { typesAnyOf: ["instant", "sorcery"] } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {U}{R} to copy that spell?",
        cost: "{U}{R}",
        effect: { kind: "copy-spell", target: "trigger-spell", newTargets: true },
      },
      resolve: null,
      text: COPY_SPELL,
    },
    {
      trigger: {
        on: "enters-battlefield",
        who: "you-control",
        filter: { token: false, type: "creature" },
        otherOnly: true,
      },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {G}{U} to create a token that's a copy of that creature?",
        cost: "{G}{U}",
        effect: { kind: "create-token-copy", of: "trigger-object", count: 1, who: "you" },
      },
      resolve: null,
      text: COPY_CREATURE,
    },
  ],
});
