import { defineCard } from "../define.js";

// EDHREC rank 17614. Top-1000 commander #951.
//
// Rulings:
//   [2022-09-09] If Tetsuo isn't equipped when it's declared as an attacking creature, the ability
//     won't trigger. If Tetsuo isn't equipped when the ability resolves, the ability won't do
//     anything.
//
// "If it's equipped" is an intervening-if (rule 603.4): checked as it
// attacks and again as it resolves. The modes are chosen as the trigger goes
// on the stack (rule 700.2b). "The greatest mana value among Equipment
// attached to it" is read as each mode resolves (rule 608.2h): the
// Equipment attached to Tetsuo now, or as it last existed if it's gone.

const DAMAGE_MODE = "Tetsuo deals damage equal to the greatest mana value among Equipment attached to it to any target.";
const CAST_MODE =
  "You may cast an instant or sorcery spell from your hand with mana value less than or equal to the greatest mana value among Equipment attached to Tetsuo without paying its mana cost.";
const GREATEST = {
  aggregate: "max",
  of: "mana-value",
  filter: { subtype: "Equipment", wasAttachedTo: "source" },
} as const;

export default defineCard({
  name: "Tetsuo, Imperial Champion",
  manaCost: "{U}{B}{R}",
  colors: ["U", "B", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Samurai"],
  power: 3,
  toughness: 3,
  text: `Whenever Tetsuo attacks, if it's equipped, choose one —\n• ${DAMAGE_MODE}\n• ${CAST_MODE}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      condition: { kind: "source", filter: { equipped: true } },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          {
            text: DAMAGE_MODE,
            targets: ["any-target"],
            effect: { kind: "damage", target: 0, amount: GREATEST },
          },
          {
            text: CAST_MODE,
            effect: {
              kind: "cast-now",
              from: "hand",
              free: true,
              spell: { typesAnyOf: ["instant", "sorcery"], manaValue: { op: "lte", n: { amount: GREATEST } } },
            },
          },
        ],
      },
      resolve: null,
      text: "Whenever Tetsuo attacks, if it's equipped, choose one —",
    },
  ],
});
