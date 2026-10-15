import { defineCard } from "../define.js";

// EDHREC rank 21924.
// Makes Jace → "Jace Token"; Beast → "Beast Token (Garruk, Veiled Butcher)" (4/4 trample).
//
// Rulings:
//   [2026-08-21] If you control a Jace planeswalker token, you can't choose to create a new one
//     when you empower Jace. You have to put the loyalty counters on your existing Jace
//     planeswalker token.
//   [2026-08-21] Only one loyalty ability of each planeswalker may be activated per turn, no
//     matter how many it has gained.
//
// Way of the Deathbringer's shape: the granted −4 is a `grantsActivated`
// loyalty ability on every planeswalker you control.

const EMPOWER_TEXT =
  "When Way of the Wildspeaker enters, empower Jace 7. (Put seven loyalty counters on a Jace token you control. " +
  "If you don't control one, first create a blue Jace planeswalker token with \"[−1]: Surveil 1\" and \"[−3]: Draw a card.\")";
const GRANTED_TEXT = "−4: Create a 4/4 green Beast creature token with trample.";
const GRANT_TEXT = 'Planeswalkers you control have "[−4]: Create a 4/4 green Beast creature token with trample."';

export default defineCard({
  name: "Way of the Wildspeaker",
  manaCost: "{4}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["enchantment"],
  text: `${EMPOWER_TEXT}\n${GRANT_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "empower-jace", amount: 7 },
      resolve: null,
      text: "When Way of the Wildspeaker enters, empower Jace 7.",
    },
  ],
  static: [
    {
      affects: { scope: "filter", filter: { type: "planeswalker", controlledBy: "you" } },
      grantsActivated: [
        {
          loyaltyCost: -4,
          cost: { mana: null, tap: false },
          targets: [],
          effect: { kind: "create-token", token: "Beast Token (Garruk, Veiled Butcher)", count: 1 },
          resolve: null,
          text: GRANTED_TEXT,
        },
      ],
      text: GRANT_TEXT,
    },
  ],
});
