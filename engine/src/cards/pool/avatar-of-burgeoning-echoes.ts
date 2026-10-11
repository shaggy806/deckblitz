import { defineCard } from "../define.js";

// EDHREC rank 20502. Reality Fracture.
//
// Rulings:
//   [2026-08-21] Only one loyalty ability of each planeswalker may be activated per turn, no
//     matter how many it has gained.
//
// The granted "−10" counts the lands its controller controls as it resolves.

const LANDFALL_TEXT =
  "Landfall — Whenever a land you control enters, empower Jace 2. (Put two loyalty counters on a Jace token you control. " +
  "If you don't control one, first create a blue Jace planeswalker token with \"[−1]: Surveil 1\" and \"[−3]: Draw a card.\")";
const GRANT_TEXT =
  "Planeswalkers you control have \"[−10]: Put a +1/+1 counter on target creature for each land you control.\"";

export default defineCard({
  name: "Avatar of Burgeoning Echoes",
  manaCost: "{G}{U}",
  colors: ["G", "U"],
  types: ["creature"],
  subtypes: ["Avatar"],
  power: 2,
  toughness: 3,
  text: `${LANDFALL_TEXT}\n${GRANT_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "land" } },
      targets: [],
      effect: { kind: "empower-jace", amount: 2 },
      resolve: null,
      text: "Landfall — Whenever a land you control enters, empower Jace 2.",
    },
  ],
  static: [
    {
      affects: { scope: "filter", filter: { type: "planeswalker", controlledBy: "you" } },
      grantsActivated: [
        {
          loyaltyCost: -10,
          cost: { mana: null, tap: false },
          targets: ["creature"],
          effect: {
            kind: "add-counter",
            target: 0,
            counter: "+1/+1",
            amount: { countOf: { type: "land", controlledBy: "you" } },
          },
          resolve: null,
          text: "−10: Put a +1/+1 counter on target creature for each land you control.",
        },
      ],
      text: GRANT_TEXT,
    },
  ],
});
