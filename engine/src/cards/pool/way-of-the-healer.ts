import { defineCard } from "../define.js";

// EDHREC rank 18313. Reality Fracture.
//
// Rulings:
//   [2026-08-21] Only one loyalty ability of each planeswalker may be activated per turn, no
//     matter how many it has gained.
//
// Way of the Pyromancer's shape: the granted "−2" is a loyalty ability of each
// planeswalker you control (the Jace token included), so it counts as that
// permanent's one loyalty activation this turn.

const EMPOWER_TEXT =
  "When Way of the Healer enters, empower Jace 5. (Put five loyalty counters on a Jace token you control. " +
  "If you don't control one, first create a blue Jace planeswalker token with \"[−1]: Surveil 1\" and \"[−3]: Draw a card.\")";
const GRANT_TEXT =
  "Planeswalkers you control have \"[−2]: Create a 2/2 colorless Wizard Soldier creature token named Cadet. Surveil 1.\"";

export default defineCard({
  name: "Way of the Healer",
  manaCost: "{3}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["enchantment"],
  text: `${EMPOWER_TEXT}\n${GRANT_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "empower-jace", amount: 5 },
      resolve: null,
      text: "When Way of the Healer enters, empower Jace 5.",
    },
  ],
  static: [
    {
      affects: { scope: "filter", filter: { type: "planeswalker", controlledBy: "you" } },
      grantsActivated: [
        {
          loyaltyCost: -2,
          cost: { mana: null, tap: false },
          targets: [],
          effect: {
            kind: "sequence",
            effects: [
              { kind: "create-token", token: "Cadet", count: 1 },
              { kind: "surveil", amount: 1 },
            ],
          },
          resolve: null,
          text: "−2: Create a 2/2 colorless Wizard Soldier creature token named Cadet. Surveil 1.",
        },
      ],
      text: GRANT_TEXT,
    },
  ],
});
