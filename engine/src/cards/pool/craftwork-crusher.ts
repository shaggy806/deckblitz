import { defineCard } from "../define.js";

// EDHREC rank 25710.
// Makes Cadet → "Cadet".
//
// Rulings:
//   [2026-08-21] If the first mode is chosen and the target creature or planeswalker becomes an
//     illegal target before the ability resolves, then the ability will be removed from the stack
//     and none of its other effects will happen.
//
// A modal trigger announces its two modes as it goes on the stack, the
// damage mode bringing its own target (The Mightstone and Weakstone's shape).
const ETB_TEXT = "When this creature enters, choose two —";
const DAMAGE_MODE = "• This creature deals 4 damage to target creature or planeswalker.";
const CADET_MODE = "• Create a 2/2 colorless Wizard Soldier creature token named Cadet.";
const DRAW_MODE = "• Draw a card.";

export default defineCard({
  name: "Craftwork Crusher",
  manaCost: "{3}{R}{R}{G}{G}",
  colors: ["R", "G"],
  types: ["artifact", "creature"],
  subtypes: ["Boar", "Construct"],
  power: 7,
  toughness: 5,
  keywords: ["trample"],
  text: `Trample\n${ETB_TEXT}\n${DAMAGE_MODE}\n${CADET_MODE}\n${DRAW_MODE}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        minModes: 2,
        maxModes: 2,
        modes: [
          {
            text: DAMAGE_MODE,
            targets: [{ kind: "permanent", whose: "any", filter: { typesAnyOf: ["creature", "planeswalker"] } }],
            effect: { kind: "damage", amount: 4, target: 0 },
          },
          { text: CADET_MODE, effect: { kind: "create-token", token: "Cadet", count: 1 } },
          { text: DRAW_MODE, effect: { kind: "draw", amount: 1 } },
        ],
      },
      resolve: null,
      text: `${ETB_TEXT} ${DAMAGE_MODE} ${CADET_MODE} ${DRAW_MODE}`,
    },
  ],
});
