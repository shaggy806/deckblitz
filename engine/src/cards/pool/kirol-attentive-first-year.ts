import { defineCard } from "../define.js";

// EDHREC rank 7386.
//
// Rulings:
//   [2025-11-17] If the ability copied by Kirol's ability is modal (that is, if it says, "Choose
//     one —" or similar), the mode is copied and can't be changed.
//   [2025-11-17] Any choices made when the ability resolves won't have been made yet when it's
//     copied by Kirol's ability. Any such choices will be made separately when the copy resolves.
//     If a triggered ability asks you to pay a cost, you pay that cost for the copy separately.
//   [2025-11-17] The source of the copy created by Kirol's ability is the same as the source of
//     the original ability.

const TEXT =
  "Tap two untapped creatures you control: Copy target triggered ability you control. You may choose new targets for the copy. Activate only once each turn.";

export default defineCard({
  name: "Kirol, Attentive First-Year",
  manaCost: "{1}{R/W}{R/W}",
  colors: ["W", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Vampire", "Cleric"],
  power: 3,
  toughness: 3,
  text: TEXT,
  activated: [
    {
      // Kirol may be one of the two: tapping it isn't a {T} cost, so
      // summoning sickness doesn't stop it (rule 302.6).
      cost: {
        mana: null,
        tap: false,
        tapOthers: { count: 2, filter: { type: "creature", controlledBy: "you" }, includeSelf: true },
      },
      targets: [{ kind: "ability", whose: "you", abilityKind: "triggered" }],
      effect: { kind: "copy-ability", target: 0, newTargets: true },
      resolve: null,
      text: TEXT,
      oncePerTurn: true,
    },
  ],
});
