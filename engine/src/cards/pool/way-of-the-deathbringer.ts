import { defineCard } from "../define.js";

// EDHREC rank 21233.
// Makes Jace → "Jace Token"; Beast → "Beast Token (Garruk, Veiled Butcher)" (4/4 trample).
//
// Rulings:
//   [2026-08-21] If you control a Jace planeswalker token, you can't choose to create a new one
//     when you empower Jace. You have to put the loyalty counters on your existing Jace
//     planeswalker token.
//   [2026-08-21] Only one loyalty ability of each planeswalker may be activated per turn, no
//     matter how many it has gained.
//
// The granted −2 is Way of the Pyromancer's grant; its "you may sacrifice a
// creature. If you do, …" is High Society Hunter's `each-player-may` with an
// `ifDid`, asked of the planeswalker's controller as it resolves.

const EMPOWER_TEXT =
  "When Way of the Deathbringer enters, empower Jace 5. (Put five loyalty counters on a Jace token you control. " +
  "If you don't control one, first create a blue Jace planeswalker token with \"[−1]: Surveil 1\" and \"[−3]: Draw a card.\")";
const GRANTED_TEXT = "−2: You may sacrifice a creature. If you do, create a 4/4 green Beast creature token with trample.";
const GRANT_TEXT =
  "Planeswalkers you control have \"[−2]: You may sacrifice a creature. If you do, create a 4/4 green Beast creature token with trample.\"";

export default defineCard({
  name: "Way of the Deathbringer",
  manaCost: "{2}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["enchantment"],
  text: `${EMPOWER_TEXT}\n${GRANT_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "empower-jace", amount: 5 },
      resolve: null,
      text: "When Way of the Deathbringer enters, empower Jace 5.",
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
            kind: "each-player-may",
            who: "you",
            options: [{ sacrifice: { type: "creature" }, text: "Sacrifice a creature" }],
            ifDid: { kind: "create-token", token: "Beast Token (Garruk, Veiled Butcher)", count: 1 },
          },
          resolve: null,
          text: GRANTED_TEXT,
        },
      ],
      text: GRANT_TEXT,
    },
  ],
});
