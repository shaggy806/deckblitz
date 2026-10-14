import { defineCard } from "../define.js";

// EDHREC rank 7005.
//
// Rulings:
//   [2022-10-07] The copy is created on the stack, so it's not "cast" or "activated." Creating the
//     copy won't cause abilities that trigger when a player casts a spell or activates an ability
//     to trigger.
//   [2022-10-07] Any choices made when the spell or ability resolves won't have been made yet when
//     it's copied. Any such choices will be made separately when the copy resolves.
//   [2022-10-07] If the spell or ability has damage divided as it was put onto the stack, the
//     division can't be changed, although the targets receiving that damage still can. The same is
//     true of spells and abilities that distribute counters.
//   [2022-10-07] The {C}{C} created by the mana ability doesn't need to be spent on the next spell
//     or ability with {X} in its cost in order to copy it. That spell or ability will be copied
//     even if that mana is spent on something else or not spent on anything at all.
//   [2022-10-07] Activated abilities contain a colon. They're generally written "[Cost]:
//     [Effect]." Some keyword abilities are activated abilities and will have a colon in their
//     reminder text. Triggered abilities (starting with "when," "whenever," or "at") that ask a
//     player to pay {X} aren't copied.
//   [2022-10-07] A spell or ability with a cost that includes X, but not the mana symbol {X},
//     won't be copied.
//   [2022-10-07] Spells with additional costs that include {X} won't be affected by Magus Lucea
//     Kane. {X} must be in the spell's mana cost.
//   [2022-10-07] If the spell or ability that's copied is modal (that is, it says "Choose one —"
//     or the like), the copy will have the same mode or modes. You can't choose different ones.
//   [2022-10-07] You can't choose to pay any additional costs for a copied spell. However, effects
//     based on any additional costs that were paid for the original spell are copied as though
//     those same costs were paid for the copy too.
//   [2022-10-07] If a permanent spell is copied, it's put onto the battlefield as a token as the
//     spell resolves rather than putting the copy of the spell onto the battlefield. The rules
//     that apply to a permanent spell becoming a permanent apply to a copy of a spell becoming a
//     token.
//   [2022-10-07] The copy will resolve before the original spell or ability does.
//   [2022-10-07] Magus Lucea Kane's ability will copy any spell or activated ability whose mana
//     cost or activation cost contains {X}, not just one with targets.
//   [2022-10-07] The copy has the same value of X.
//   [2022-10-07] A copy is created even if the spell or ability that caused the delayed triggered
//     ability to trigger has been countered by the time that delayed triggered ability resolves.
//     The copy resolves before the original spell.
//   [2022-10-07] The token that a resolving copy of a spell becomes isn't said to have been
//     "created."
//   [2022-10-07] The copy will have the same targets as the spell or ability it's copying unless
//     you choose new ones. You may change any number of the targets, including all of them or none
//     of them. If the spell is a permanent spell with targets, such as an Aura, you may also
//     choose a new target for that spell. The new targets must be legal. If, for any target, you
//     can't choose a new legal target, then it remains unchanged (even if the current target is
//     illegal).

export default defineCard({
  name: "Magus Lucea Kane",
  manaCost: "{1}{G}{U}{R}",
  colors: ["U", "R", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Tyranid", "Wizard"],
  power: 1,
  toughness: 1,
  text: "Spiritual Leader — At the beginning of combat on your turn, put a +1/+1 counter on target creature.\nPsychic Stimulus — {T}: Add {C}{C}. When you next cast a spell with {X} in its mana cost or activate an ability with {X} in its activation cost this turn, copy that spell or ability. You may choose new targets for the copy. (A copy of a permanent spell becomes a token.)",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: "C",
        amount: 2,
        // The {C}{C} needn't pay for it (the ruling): the next one is copied
        // whatever paid. Its trigger object is a spell or an ability, so one
        // of these copies it and the other finds nothing to copy.
        also: {
          kind: "delayed-trigger",
          at: { nextSpell: { xInManaCost: true }, orNextAbility: { xInCost: true } },
          effect: {
            kind: "sequence",
            effects: [
              { kind: "copy-spell", target: "trigger-spell", newTargets: true },
              { kind: "copy-ability", target: "trigger-ability", newTargets: true },
            ],
          },
          text: "Copy that spell or ability. You may choose new targets for the copy.",
        },
      },
      resolve: null,
      text: "Psychic Stimulus — {T}: Add {C}{C}. When you next cast a spell with {X} in its mana cost or activate an ability with {X} in its activation cost this turn, copy that spell or ability. You may choose new targets for the copy.",
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: ["creature"],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "Spiritual Leader — At the beginning of combat on your turn, put a +1/+1 counter on target creature.",
    },
  ],
});
