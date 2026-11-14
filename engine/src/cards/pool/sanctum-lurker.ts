import { defineCard } from "../define.js";

// EDHREC rank 8556.
//
// Rulings:
//   If a planeswalker you control has zero loyalty counters while you control Sanctum Lurker, it
//   will not be put into its owner's graveyard. You may still activate abilities of that
//   planeswalker that cost [0] or that add counters to it as a cost, such as the one granted by
//   Sanctum Lurker.
//   Only one loyalty ability of each planeswalker may be activated per turn, no matter how many it
//   has gained.
//
// The 0-loyalty exemption is `zeroLoyaltySurvives` (rule 704.5i passes over
// them); a cost that removes loyalty still needs the counters (rule 606.6).

const EMPOWER_TEXT = "When this creature enters, empower Jace 1.";
const SURVIVE_TEXT = "Planeswalkers you control aren't put into their owners' graveyards for having 0 loyalty.";
const GRANT_TEXT =
  "Planeswalkers you control have \"[+2]: This planeswalker deals 1 damage to each opponent and you gain 1 life.\"";
const PLANESWALKERS_YOU_CONTROL = { scope: "filter", filter: { type: "planeswalker", controlledBy: "you" } } as const;

export default defineCard({
  name: "Sanctum Lurker",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Horror"],
  power: 3,
  toughness: 2,
  text:
    `${EMPOWER_TEXT} (Put a loyalty counter on a Jace token you control. If you don't control one, first create a blue Jace planeswalker token with "[−1]: Surveil 1" and "[−3]: Draw a card.")\n` +
    `${SURVIVE_TEXT}\n${GRANT_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "empower-jace", amount: 1 },
      resolve: null,
      text: EMPOWER_TEXT,
    },
  ],
  static: [
    { affects: PLANESWALKERS_YOU_CONTROL, zeroLoyaltySurvives: true, text: SURVIVE_TEXT },
    {
      affects: PLANESWALKERS_YOU_CONTROL,
      grantsActivated: [
        {
          loyaltyCost: 2,
          cost: { mana: null, tap: false },
          targets: [],
          effect: {
            kind: "sequence",
            effects: [
              { kind: "damage", amount: 1, who: "each-opponent" },
              { kind: "gain-life", amount: 1 },
            ],
          },
          resolve: null,
          text: "+2: This planeswalker deals 1 damage to each opponent and you gain 1 life.",
        },
      ],
      text: GRANT_TEXT,
    },
  ],
});
