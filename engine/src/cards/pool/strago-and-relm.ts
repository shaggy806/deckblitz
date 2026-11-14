import { defineCard } from "../define.js";

// Rulings:
//   If you cast a spell "without paying its mana cost," you can't choose to cast it for any
//     alternative costs. You can, however, pay additional costs.
//   You cast the card while Strago and Relm's ability is resolving and still on the stack. You
//     can't wait to play it later in the turn. Timing restrictions based on its types are ignored.
//   If a spell has {X} in its mana cost, you must choose 0 as the value of X.
//
// The opponent exiles until an instant, sorcery or creature card; the cards stay exiled whether
// or not it's cast. A creature spell cast this way gains haste and the end-step sacrifice, with
// no duration: for as long as it's that object (rules 611.2a, 400.7) — a `cast-now`'s
// `gainsHaste: "indefinitely"` and `gainsTriggered`, both only for a creature spell
// (`gainsIf`): a creature card cast as a noncreature face gains neither.

const GAINED_TEXT = "At the beginning of the end step, sacrifice this creature.";
const TEXT =
  'Sketch and Lore — {2}{R}, {T}: Target opponent exiles cards from the top of their library until they exile an instant, sorcery, or creature card. You may cast that card without paying its mana cost. If you cast a creature spell this way, it gains haste and "At the beginning of the end step, sacrifice this creature." Activate only as a sorcery.';

export default defineCard({
  name: "Strago and Relm",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  supertypes: ["legendary"],
  subtypes: ["Human", "Wizard"],
  power: 1,
  toughness: 3,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{2}{R}", tap: true },
      sorcerySpeed: true,
      targets: ["opponent"],
      effect: {
        kind: "reveal-until",
        whose: 0,
        filter: { typesAnyOf: ["instant", "sorcery", "creature"] },
        exile: true,
        then: {
          kind: "cast-now",
          target: 0,
          free: true,
          gainsIf: { type: "creature" },
          gainsHaste: "indefinitely",
          gainsTriggered: [
            {
              trigger: { on: "step-begins", step: "end", who: "any" },
              targets: [],
              effect: { kind: "sacrifice-source" },
              resolve: null,
              text: GAINED_TEXT,
            },
          ],
        },
        rest: "stay",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
