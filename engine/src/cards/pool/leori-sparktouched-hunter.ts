import { defineCard } from "../define.js";
import { CHOSEN_CREATURE_TYPE, PLANESWALKER_TYPES } from "../helpers.js";

// Commander Masters (CMM). EDHREC rank 11022.
//
// Rulings:
//   If the loyalty ability has -X in its cost, the copy uses the same value of X.
//   You must choose an existing planeswalker type, such as Chandra or Guff.
//   The delayed triggered ability created by Leori's last ability, as well as
//     the copy it creates, resolve before the ability that caused it to
//     trigger. They resolve even if that ability is countered.
//   Copying a loyalty ability doesn't add or remove loyalty counters from any
//     object.
const COPY =
  "Whenever Leori deals combat damage to a player, choose a planeswalker type. Until end of turn, whenever you activate an ability of a planeswalker of that type, copy that ability. You may choose new targets for the copies.";

/**
 * Leori, Sparktouched Hunter. The type is chosen as the trigger resolves, from
 * rule 205.3j's list (the `choose-creature-type` menu over
 * `PLANESWALKER_TYPES`, as Deification's). What it sets up is a delayed
 * "whenever" for the rest of the turn (rule 603.7), not a "next" one: every
 * ability of a planeswalker of that type activated this turn is copied, a
 * loyalty ability or any other, each copy put on the stack above it (rule
 * 707.10) and so resolving first, and changing no loyalty.
 */
export default defineCard({
  name: "Leori, Sparktouched Hunter",
  manaCost: "{U}{R}{W}",
  colors: ["U", "R", "W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elemental", "Cat"],
  power: 3,
  toughness: 3,
  keywords: ["flying", "vigilance"],
  text: `Flying, vigilance\n${COPY}`,
  triggered: [
    {
      trigger: { on: "deals-damage", who: "self", to: "player", combat: true },
      targets: [],
      effect: {
        kind: "choose-creature-type",
        options: PLANESWALKER_TYPES,
        prompt: "choose a planeswalker type",
        then: {
          kind: "delayed-trigger",
          at: {
            whenever: {
              on: "activates-ability",
              who: "you",
              source: { type: "planeswalker", subtype: CHOSEN_CREATURE_TYPE },
            },
          },
          effect: { kind: "copy-ability", target: "trigger-ability", newTargets: true },
          text: "Copy that ability. You may choose new targets for the copies.",
        },
      },
      resolve: null,
      text: COPY,
    },
  ],
});
