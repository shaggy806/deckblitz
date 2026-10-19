import { defineCard } from "../define.js";

// EDHREC rank 12524.
//
// Rulings:
//   You can't choose to pay any additional costs for the copy created by Najal's delayed triggered
//     ability. However, effects based on any additional costs that were paid for the original
//     spell are copied as though those same costs were paid for the copy too.
//   If the spell that's copied is modal (that is, it says "Choose one —" or the like), the copy
//     created by Najal's delayed triggered ability will have the same mode or modes. You can't
//     choose different ones.
//   The copies that Najal's ability creates are created on the stack, so they're not "cast."
//     Abilities that trigger when a player casts a spell won't trigger.
//   If the spell that's copied has damage divided as it was cast, the division can't be changed
//     (although the targets receiving that damage still can). The same is true of spells that
//     distribute counters.
//
// Paying {2} sets up Rimefire Torque's delayed trigger: the next instant or
// sorcery its controller casts this turn, once.
const FLASH_TEXT = "You may cast sorcery spells as though they had flash.";
const ATTACK_TEXT =
  "Whenever Najal attacks, you may pay {2}. If you do, when you next cast an instant or sorcery spell this turn, copy it. You may choose new targets for the copy.";

export default defineCard({
  name: "Najal, the Storm Runner",
  manaCost: "{2}{U}{U}{R}",
  colors: ["U", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Efreet", "Wizard"],
  power: 5,
  toughness: 4,
  text: `${FLASH_TEXT}\n${ATTACK_TEXT}`,
  static: [{ affects: { scope: "self" }, castAsThoughFlash: { type: "sorcery" }, text: FLASH_TEXT }],
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {2} to copy your next instant or sorcery spell this turn?",
        cost: "{2}",
        effect: {
          kind: "delayed-trigger",
          at: { nextSpell: { typesAnyOf: ["instant", "sorcery"] } },
          effect: { kind: "copy-spell", target: "trigger-spell", newTargets: true },
          text: "When you next cast an instant or sorcery spell this turn, copy it. You may choose new targets for the copy.",
        },
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
